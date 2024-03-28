import { fromBase64 } from "@cosmjs/encoding";
import { deserialize } from "@dao-xyz/borsh";
import BigNumber from "bignumber.js";
import { v4 as uuid } from "uuid";
import browser, { Windows } from "webextension-polyfill";

import { SupportedTx, TxType } from "@namada/sdk/web";
import { KVStore } from "@namada/storage";
import {
  AccountType,
  BondMsgValue,
  EthBridgeTransferMsgValue,
  IbcTransferMsgValue,
  SignatureResponse,
  TransferMsgValue,
  TxMsgValue,
  UnbondMsgValue,
  VoteProposalMsgValue,
  WithdrawMsgValue,
} from "@namada/types";

import { assertNever, paramsToUrl } from "@namada/utils";
import { KeyRingService } from "background/keyring";
import { LedgerService } from "background/ledger";

import { VaultService } from "background/vault";
import { ExtensionBroadcaster } from "extension";
import { LocalStorage } from "storage";
import { TxStore } from "./types";

type GetParams = (
  specificMsg: Uint8Array,
  txDetails: TxMsgValue
) => Record<string, string>;

export class ApprovalsService {
  // holds promises which can be resolved with a message from a pop-up window
  protected resolverMap: Record<
    number,
    // TODO: there should be better typing for this
    // eslint-disable-next-line
    { resolve: (result?: any) => void; reject: (error?: any) => void }
  > = {};

  constructor(
    protected readonly txStore: KVStore<TxStore>,
    protected readonly dataStore: KVStore<string>,
    protected readonly localStorage: LocalStorage,
    protected readonly keyRingService: KeyRingService,
    protected readonly ledgerService: LedgerService,
    protected readonly vaultService: VaultService,
    protected readonly broadcaster: ExtensionBroadcaster
  ) {}

  async approveSignature(
    signer: string,
    data: string
  ): Promise<SignatureResponse> {
    const msgId = uuid();

    await this.dataStore.set(msgId, data);
    const baseUrl = `${browser.runtime.getURL(
      "approvals.html"
    )}#/approve-signature/${signer}`;

    const url = paramsToUrl(baseUrl, {
      msgId,
    });
    const popupTabId = await this.getPopupTabId(url);

    // TODO: can tabId be 0?
    if (!popupTabId) {
      throw new Error("no popup tab ID");
    }

    if (popupTabId in this.resolverMap) {
      throw new Error(`tab ID ${popupTabId} already exists in promise map`);
    }

    return await new Promise((resolve, reject) => {
      this.resolverMap[popupTabId] = { resolve, reject };
    });
  }

  async submitSignature(
    popupTabId: number,
    msgId: string,
    signer: string
  ): Promise<void> {
    const data = await this.dataStore.get(msgId);
    const resolvers = this.resolverMap[popupTabId];

    if (!resolvers) {
      throw new Error(`no resolvers found for tab ID ${popupTabId}`);
    }

    if (!data) {
      throw new Error(`Signing data for ${msgId} not found!`);
    }
    //TODO: Shouldn't we _clearPendingSignature when throwing?

    try {
      const signature = await this.keyRingService.signArbitrary(signer, data);
      resolvers.resolve(signature);
    } catch (e) {
      resolvers.reject(e);
    }

    await this._clearPendingSignature(msgId);
  }

  async rejectSignature(popupTabId: number, msgId: string): Promise<void> {
    const resolvers = this.resolverMap[popupTabId];

    if (!resolvers) {
      throw new Error(`no resolvers found for tab ID ${popupTabId}`);
    }

    await this._clearPendingSignature(msgId);
    resolvers.reject();
  }

  async approveTx(
    txType: SupportedTx,
    txMsg: string,
    specificMsg: string,
    type: AccountType
  ): Promise<void> {
    const msgId = uuid();
    await this.txStore.set(msgId, { txType, txMsg, specificMsg });

    // Decode tx details and launch approval screen
    const txMsgBuffer = Buffer.from(fromBase64(txMsg));
    const txDetails = deserialize(txMsgBuffer, TxMsgValue);

    const specificMsgBuffer = Buffer.from(fromBase64(specificMsg));

    const getParams =
      txType === TxType.Bond
        ? ApprovalsService.getParamsBond
        : txType === TxType.Unbond
          ? ApprovalsService.getParamsUnbond
          : txType === TxType.Withdraw
            ? ApprovalsService.getParamsWithdraw
            : txType === TxType.Transfer
              ? ApprovalsService.getParamsTransfer
              : txType === TxType.IBCTransfer
                ? ApprovalsService.getParamsIbcTransfer
                : txType === TxType.EthBridgeTransfer
                  ? ApprovalsService.getParamsEthBridgeTransfer
                  : txType === TxType.VoteProposal
                    ? ApprovalsService.getParamsVoteProposal
                    : assertNever(txType);

    const baseUrl = `${browser.runtime.getURL(
      "approvals.html"
    )}#/approve-tx/${txType}`;

    const url = paramsToUrl(baseUrl, {
      ...getParams(specificMsgBuffer, txDetails),
      msgId,
      accountType: type,
    });

    await this._launchApprovalWindow(url);
  }

  static getParamsTransfer: GetParams = (specificMsg, txDetails) => {
    const specificDetails = deserialize(specificMsg, TransferMsgValue);

    const {
      source,
      target,
      token: tokenAddress,
      amount: amountBN,
    } = specificDetails;
    const amount = new BigNumber(amountBN.toString());

    const { publicKey, nativeToken } = ApprovalsService.getTxDetails(txDetails);

    return {
      source,
      target,
      tokenAddress,
      amount: amount.toString(),
      publicKey,
      nativeToken,
    };
  };

  static getParamsIbcTransfer: GetParams = (specificMsg, txDetails) => {
    const specificDetails = deserialize(specificMsg, IbcTransferMsgValue);

    const {
      source,
      receiver: target,
      token: tokenAddress,
      amount: amountBN,
    } = specificDetails;
    const amount = new BigNumber(amountBN.toString());

    const { publicKey, nativeToken } = ApprovalsService.getTxDetails(txDetails);

    return {
      source,
      target,
      tokenAddress,
      amount: amount.toString(),
      publicKey,
      nativeToken,
    };
  };

  static getParamsEthBridgeTransfer: GetParams = (specificMsg, txDetails) => {
    const specificDetails = deserialize(specificMsg, EthBridgeTransferMsgValue);

    const {
      asset: tokenAddress,
      recipient: target,
      sender: source,
      amount,
    } = specificDetails;

    const { publicKey, nativeToken } = ApprovalsService.getTxDetails(txDetails);

    return {
      source,
      target,
      tokenAddress,
      amount: amount.toString(),
      publicKey,
      nativeToken,
    };
  };

  static getParamsBond: GetParams = (specificMsg, txDetails) => {
    const specificDetails = deserialize(specificMsg, BondMsgValue);

    const {
      source,
      nativeToken: tokenAddress,
      amount: amountBN,
    } = specificDetails;
    const amount = new BigNumber(amountBN.toString());

    const { publicKey } = ApprovalsService.getTxDetails(txDetails);

    return {
      source,
      tokenAddress,
      amount: amount.toString(),
      publicKey,
      nativeToken: tokenAddress,
    };
  };

  static getParamsUnbond: GetParams = (specificMsg, txDetails) => {
    const specificDetails = deserialize(specificMsg, UnbondMsgValue);

    const { source, amount: amountBN } = specificDetails;
    const amount = new BigNumber(amountBN.toString());

    const { publicKey, nativeToken } = ApprovalsService.getTxDetails(txDetails);

    return {
      source,
      amount: amount.toString(),
      publicKey,
      nativeToken,
    };
  };

  static getParamsWithdraw: GetParams = (specificMsg, txDetails) => {
    const specificDetails = deserialize(specificMsg, WithdrawMsgValue);

    const { source, validator } = specificDetails;

    const { publicKey, nativeToken } = ApprovalsService.getTxDetails(txDetails);

    return {
      source,
      validator,
      publicKey,
      nativeToken,
    };
  };

  static getParamsVoteProposal: GetParams = (specificMsg, txDetails) => {
    const specificDetails = deserialize(specificMsg, VoteProposalMsgValue);

    const { signer } = specificDetails;

    const { publicKey, nativeToken } = ApprovalsService.getTxDetails(txDetails);

    //TODO: check this
    return {
      source: signer,
      publicKey,
      nativeToken,
    };
  };

  // Remove pending transaction from storage
  async rejectTx(msgId: string): Promise<void> {
    await this._clearPendingTx(msgId);
  }

  // Authenticate keyring and submit approved transaction from storage
  async submitTx(msgId: string): Promise<void> {
    // Fetch pending transfer tx
    const tx = await this.txStore.get(msgId);

    if (!tx) {
      throw new Error("Pending tx not found!");
    }

    const { txType, specificMsg, txMsg } = tx;

    const submitFn =
      txType === TxType.Bond
        ? this.keyRingService.submitBond
        : txType === TxType.Unbond
          ? this.keyRingService.submitUnbond
          : txType === TxType.Transfer
            ? this.keyRingService.submitTransfer
            : txType === TxType.IBCTransfer
              ? this.keyRingService.submitIbcTransfer
              : txType === TxType.EthBridgeTransfer
                ? this.keyRingService.submitEthBridgeTransfer
                : txType === TxType.Withdraw
                  ? this.keyRingService.submitWithdraw
                  : txType === TxType.VoteProposal
                    ? this.keyRingService.submitVoteProposal
                    : assertNever(txType);

    await submitFn.call(this.keyRingService, specificMsg, txMsg, msgId);

    return await this._clearPendingTx(msgId);
  }

  async isConnectionApproved(interfaceOrigin: string): Promise<boolean> {
    const approvedOrigins =
      (await this.localStorage.getApprovedOrigins()) || [];

    return approvedOrigins.includes(interfaceOrigin);
  }

  async approveConnection(
    interfaceTabId: number,
    interfaceOrigin: string
  ): Promise<void> {
    const baseUrl = `${browser.runtime.getURL(
      "approvals.html"
    )}#/approve-connection`;

    const url = paramsToUrl(baseUrl, {
      interfaceTabId: interfaceTabId.toString(),
      interfaceOrigin,
    });

    const alreadyApproved = await this.isConnectionApproved(interfaceOrigin);

    if (!alreadyApproved) {
      const popupTabId = await this.getPopupTabId(url);

      if (!popupTabId) {
        throw new Error("no popup tab ID");
      }

      if (popupTabId in this.resolverMap) {
        throw new Error(`tab ID ${popupTabId} already exists in promise map`);
      }

      return new Promise((resolve, reject) => {
        this.resolverMap[popupTabId] = { resolve, reject };
      });
    }

    // A resolved promise is implicitly returned here if the origin had
    // previously been approved.
  }

  async approveConnectionResponse(
    interfaceTabId: number,
    interfaceOrigin: string,
    allowConnection: boolean,
    popupTabId: number
  ): Promise<void> {
    const resolvers = this.resolverMap[popupTabId];
    if (!resolvers) {
      throw new Error(`no resolvers found for tab ID ${interfaceTabId}`);
    }

    if (allowConnection) {
      try {
        await this.localStorage.addApprovedOrigin(interfaceOrigin);
      } catch (e) {
        resolvers.reject(e);
      }
      resolvers.resolve();
    } else {
      resolvers.reject();
    }
  }

  async revokeConnection(originToRevoke: string): Promise<void> {
    await this.localStorage.removeApprovedOrigin(originToRevoke);
    await this.broadcaster.revokeConnection();
  }

  private async _clearPendingTx(msgId: string): Promise<void> {
    return await this.txStore.set(msgId, null);
  }

  private async _clearPendingSignature(msgId: string): Promise<void> {
    return await this.dataStore.set(msgId, null);
  }

  private _launchApprovalWindow = (url: string): Promise<Windows.Window> => {
    return browser.windows.create({
      url,
      width: 396,
      height: 510,
      type: "popup",
    });
  };

  private getPopupTabId = async (url: string): Promise<number | undefined> => {
    const window = await this._launchApprovalWindow(url);
    const firstTab = window.tabs?.[0];
    const popupTabId = firstTab?.id;

    return popupTabId;
  };

  private static getTxDetails = (
    txDetails: TxMsgValue
  ): { publicKey: string; nativeToken: string } => {
    const { publicKey = "", token: nativeToken } = txDetails;
    return { publicKey, nativeToken };
  };
}
