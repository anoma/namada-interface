import { fromBase64 } from "@cosmjs/encoding";
import { deserialize } from "@dao-xyz/borsh";
import BigNumber from "bignumber.js";
import { v4 as uuid } from "uuid";
import browser, { Windows } from "webextension-polyfill";

import { SupportedTx, TxType } from "@namada/shared";
import { KVStore } from "@namada/storage";
import {
  AccountType,
  EthBridgeTransferMsgValue,
  IbcTransferMsgValue,
  SignatureResponse,
  SubmitBondMsgValue,
  SubmitUnbondMsgValue,
  SubmitVoteProposalMsgValue,
  SubmitWithdrawMsgValue,
  TransferMsgValue,
  TxMsgValue,
} from "@namada/types";

import { assertNever, paramsToUrl } from "@namada/utils";
import { KeyRingService, TabStore } from "background/keyring";
import { LedgerService } from "background/ledger";

import { VaultService } from "background/vault";
import { ApprovedOriginsStore, TxStore } from "./types";
import {
  APPROVED_ORIGINS_KEY,
  addApprovedOrigin,
  removeApprovedOrigin,
} from "./utils";

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
    protected readonly connectedTabsStore: KVStore<TabStore[]>,
    protected readonly approvedOriginsStore: KVStore<ApprovedOriginsStore>,
    protected readonly keyRingService: KeyRingService,
    protected readonly ledgerService: LedgerService,
    protected readonly vaultService: VaultService
  ) { }

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
    const approvalWindow = await this._launchApprovalWindow(url);
    const popupTabId = approvalWindow.tabs?.[0]?.id;

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

    this._launchApprovalWindow(url);
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

    const { publicKey = "", token: nativeToken } = txDetails;

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

    const { publicKey = "", token: nativeToken } = txDetails;

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

    const { publicKey = "", token: nativeToken } = txDetails;

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
    const specificDetails = deserialize(specificMsg, SubmitBondMsgValue);

    const {
      source,
      nativeToken: tokenAddress,
      amount: amountBN,
    } = specificDetails;
    const amount = new BigNumber(amountBN.toString());

    const { publicKey = "" } = txDetails;

    return {
      source,
      tokenAddress,
      amount: amount.toString(),
      publicKey,
      nativeToken: tokenAddress,
    };
  };

  static getParamsUnbond: GetParams = (specificMsg, txDetails) => {
    const specificDetails = deserialize(specificMsg, SubmitUnbondMsgValue);

    const { source, amount: amountBN } = specificDetails;
    const amount = new BigNumber(amountBN.toString());

    const { publicKey = "", token: nativeToken } = txDetails;

    return {
      source,
      amount: amount.toString(),
      publicKey,
      nativeToken,
    };
  };

  static getParamsWithdraw: GetParams = (specificMsg, txDetails) => {
    const specificDetails = deserialize(specificMsg, SubmitWithdrawMsgValue);

    const { source, validator } = specificDetails;

    const { publicKey = "", token: nativeToken } = txDetails;

    return {
      source,
      validator,
      publicKey,
      nativeToken,
    };
  };

  static getParamsVoteProposal: GetParams = (specificMsg, txDetails) => {
    const specificDetails = deserialize(
      specificMsg,
      SubmitVoteProposalMsgValue
    );

    const { signer } = specificDetails;

    const { publicKey = "", token: nativeToken } = txDetails;

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

    const approvedOrigins =
      (await this.approvedOriginsStore.get(APPROVED_ORIGINS_KEY)) || [];

    if (!approvedOrigins.includes(interfaceOrigin)) {
      const approvalWindow = await this._launchApprovalWindow(url);
      const popupTabId = approvalWindow.tabs?.[0]?.id;

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
        await this.keyRingService.connect(interfaceTabId);
        await addApprovedOrigin(this.approvedOriginsStore, interfaceOrigin);
      } catch (e) {
        resolvers.reject(e);
      }
      resolvers.resolve();
    } else {
      resolvers.reject();
    }
  }

  async revokeConnection(originToRevoke: string): Promise<void> {
    return removeApprovedOrigin(this.approvedOriginsStore, originToRevoke);
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
}
