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
    
    // Create a popup window
    const popupTabId = await this.createPopup(url);

    // Attach a resolver to the window
    return this.attachResolver<SignatureResponse>(popupTabId);
  }

  async submitSignature(
    popupTabId: number,
    msgId: string,
    signer: string
  ): Promise<void> {
    this.isResolver(popupTabId);

    const data = await this.dataStore.get(msgId);
    if (!data) {
      throw new Error(`Signing data for ${msgId} not found!`);
    }
    //TODO: Shouldn't we _clearPendingSignature when throwing?

    try {
      const signature = await this.keyRingService.signArbitrary(signer, data);
      this.resolve(popupTabId, signature);
    } catch (e) {
      this.reject(popupTabId, e);
    }

    await this._clearPendingSignature(msgId);
  }

  async rejectSignature(popupTabId: number, msgId: string): Promise<void> {
    await this._clearPendingSignature(msgId);
    this.reject(popupTabId);
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

    // Create a popup window
    const popupTabId = await this.createPopup(url);

    // Attach a resolver to the window
    return this.attachResolver<void>(popupTabId);
  }

  // Authenticate keyring and submit approved transaction from storage
  async submitTx(popupTabId: number, msgId: string): Promise<void> {
    this.isResolver(popupTabId);

    // Fetch pending transfer tx
    const data = await this.txStore.get(msgId);
    if (!data) {
      throw new Error("Pending tx not found!");
    }
    //TODO: Shouldn't we _clearPendingTx when throwing?

    const { txType, specificMsg, txMsg } = data;

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

    try {
      const tx = await submitFn.call(this.keyRingService, specificMsg, txMsg, msgId);
      this.resolve(popupTabId, tx);
    } catch (e) {
      this.reject(popupTabId, e);
    }

    await this._clearPendingTx(msgId);
  }

  // Remove pending transaction from storage
  async rejectTx(popupTabId: number, msgId: string): Promise<void> {
    await this._clearPendingTx(msgId);
    this.reject(popupTabId);
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
      // Create a popup window
      const popupTabId = await this.createPopup(url);

      // Attach a resolver to the window
      return this.attachResolver<void>(popupTabId);
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
    this.isResolver(popupTabId);

    if (allowConnection) {
      try {
        await this.keyRingService.connect(interfaceTabId);
        await this.localStorage.addApprovedOrigin(interfaceOrigin);
      } catch (e) {
        this.reject(popupTabId, e);
      }
      this.resolve(popupTabId);
    } else {
      this.reject(popupTabId);
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

  private createPopup = async (url: string): Promise<number> => {
    const window = await browser.windows.create({
      url,
      width: 396,
      height: 510,
      type: "popup",
    });

    const popupTabId = window.tabs?.[0]?.id;

    // TODO: can tabId be 0?
    if (!popupTabId) {
      throw new Error("no popup tab ID");
    }

    if (popupTabId in this.resolverMap) {
      throw new Error(`tab ID ${popupTabId} already exists in promise map`);
    }

    return popupTabId;
  }

  private async attachResolver<T>(popupTabId: number): Promise<T> {
    return new Promise((resolve, reject) => {
      this.resolverMap[popupTabId] = { resolve, reject };
    });
  }

  private isResolver(popupTabId: number) {
    const resolvers = this.resolverMap[popupTabId];

    if (!resolvers) {
      throw new Error(`no resolvers found for tab ID ${popupTabId}`);
    }

    return !!resolvers;
  }

  private resolve(popupTabId: number, result?: unknown) {
    if (popupTabId in this.resolverMap) {
      this.resolverMap[popupTabId].resolve(result);
      delete this.resolverMap[popupTabId];
    }
  }

  private reject(popupTabId: number, message?: any) {
    if (popupTabId in this.resolverMap) {
      this.resolverMap[popupTabId].reject(message ?? new Error("Request rejected"));
      delete this.resolverMap[popupTabId];
    }
  }
}
