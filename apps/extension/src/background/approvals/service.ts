import browser, { Windows } from "webextension-polyfill";
import { fromBase64 } from "@cosmjs/encoding";
import { v4 as uuid } from "uuid";
import BigNumber from "bignumber.js";
import { deserialize } from "@dao-xyz/borsh";

import {
  AccountType,
  EthBridgeTransferMsgValue,
  IbcTransferMsgValue,
  SubmitBondMsgValue,
  SubmitUnbondMsgValue,
  SubmitVoteProposalMsgValue,
  SubmitWithdrawMsgValue,
  TransferMsgValue,
  TxMsgValue,
  SupportedTx,
} from "@namada/types";
import { TxType } from "@namada/shared";
import { KVStore } from "@namada/storage";

import { KeyRingService, TabStore } from "background/keyring";
import { LedgerService } from "background/ledger";
import { paramsToUrl, assertNever } from "@namada/utils";

import { ApprovedOriginsStore, TxStore } from "./types";
import {
  addApprovedOrigin,
  removeApprovedOrigin,
  APPROVED_ORIGINS_KEY,
} from "./utils";
import { VaultService } from "background/vault";

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
    protected readonly connectedTabsStore: KVStore<TabStore[]>,
    protected readonly approvedOriginsStore: KVStore<ApprovedOriginsStore>,
    protected readonly keyRingService: KeyRingService,
    protected readonly ledgerService: LedgerService,
    protected readonly vaultService: VaultService
  ) {}

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

    const { publicKey = "" } = txDetails;

    return {
      source,
      target,
      tokenAddress,
      amount: amount.toString(),
      publicKey,
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

    const { publicKey = "" } = txDetails;

    return {
      source,
      target,
      tokenAddress,
      amount: amount.toString(),
      publicKey,
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

    const { publicKey = "" } = txDetails;

    return {
      source,
      target,
      tokenAddress,
      amount: amount.toString(),
      publicKey,
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
    };
  };

  static getParamsUnbond: GetParams = (specificMsg, txDetails) => {
    const specificDetails = deserialize(specificMsg, SubmitUnbondMsgValue);

    const { source, amount: amountBN } = specificDetails;
    const amount = new BigNumber(amountBN.toString());

    const { publicKey = "" } = txDetails;

    return {
      source,
      amount: amount.toString(),
      publicKey,
    };
  };

  static getParamsWithdraw: GetParams = (specificMsg, txDetails) => {
    const specificDetails = deserialize(specificMsg, SubmitWithdrawMsgValue);

    const { source, validator } = specificDetails;

    const { publicKey = "" } = txDetails;

    return {
      source,
      validator,
      publicKey,
    };
  };

  static getParamsVoteProposal: GetParams = (specificMsg, txDetails) => {
    const specificDetails = deserialize(
      specificMsg,
      SubmitVoteProposalMsgValue
    );

    const { signer } = specificDetails;

    const { publicKey = "" } = txDetails;

    //TODO: check this
    return {
      source: signer,
      publicKey,
    };
  };

  // Remove pending transaction from storage
  async rejectTx(msgId: string): Promise<void> {
    await this._clearPendingTx(msgId);
  }

  // Authenticate keyring and submit approved transaction from storage
  async submitTx(msgId: string, password: string): Promise<void> {
    await this.vaultService.unlock(password);

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
    chainId: string,
    interfaceOrigin: string
  ): Promise<void> {
    const baseUrl = `${browser.runtime.getURL(
      "approvals.html"
    )}#/approve-connection`;

    const url = paramsToUrl(baseUrl, {
      interfaceTabId: interfaceTabId.toString(),
      chainId,
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
    chainId: string,
    interfaceOrigin: string,
    allowConnection: boolean,
    popupTabId: number
  ): Promise<void> {
    const resolvers = this.resolverMap[popupTabId];
    if (!resolvers) {
      throw new Error(`no resolvers found for tab ID ${interfaceTabId}`);
    }

    if (allowConnection) {
      await addApprovedOrigin(this.approvedOriginsStore, interfaceOrigin);
      try {
        await this.keyRingService.connect(interfaceTabId, chainId);
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

  private _launchApprovalWindow = (url: string): Promise<Windows.Window> => {
    return browser.windows.create({
      url,
      width: 415,
      height: 510,
      type: "popup",
    });
  };
}
