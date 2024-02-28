/* eslint-disable @typescript-eslint/no-explicit-any */
import * as borsh from "@dao-xyz/borsh";
import { TxType } from "@namada/shared";
import {
  AccountType,
  EthBridgeTransferMsgValue,
  IbcTransferMsgValue,
  SubmitBondMsgValue,
  SubmitUnbondMsgValue,
  SubmitVoteProposalMsgValue,
  SubmitWithdrawMsgValue,
  TokenInfo,
  TransferMsgValue,
} from "@namada/types";
import { KeyRingService, TabStore } from "background/keyring";
import { LedgerService } from "background/ledger";
import { VaultService } from "background/vault";
import BigNumber from "bignumber.js";
import createMockInstance from "jest-create-mock-instance";
import { KVStoreMock } from "test/init";
import { ApprovalsService } from "./service";
import { ApprovedOriginsStore, TxStore } from "./types";

jest.mock("webextension-polyfill", () => ({
  runtime: {
    getURL: () => "url",
  },
  windows: {
    create: jest.fn(),
  },
}));

describe.only("approvals service", () => {
  let service: ApprovalsService;
  let keyRingService: jest.Mocked<KeyRingService>;
  let dataStore: KVStoreMock<string>;
  let txStore: KVStoreMock<TxStore>;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    txStore = new KVStoreMock<TxStore>("TxStore");
    dataStore = new KVStoreMock<string>("DataStore");
    const connectedTabsStore = new KVStoreMock<TabStore[]>("TabStore");
    const approvedOriginsStore = new KVStoreMock<ApprovedOriginsStore>(
      "ApprovedOriginsStore"
    );
    keyRingService = createMockInstance(KeyRingService as any);
    const ledgerService: jest.Mocked<LedgerService> = createMockInstance(
      LedgerService as any
    );
    const vaultService: jest.Mocked<VaultService> = createMockInstance(
      VaultService as any
    );

    service = new ApprovalsService(
      txStore,
      dataStore,
      connectedTabsStore,
      approvedOriginsStore,
      keyRingService,
      ledgerService,
      vaultService
    );
  });

  describe("approveSignature", () => {
    it("should add popupTabId to resolverMap", async () => {
      const tabId = 1;
      const sigResponse = {
        hash: "hash",
        signature: "sig",
      };

      jest.spyOn(service as any, "getPopupTabId").mockResolvedValue(tabId);
      const signaturePromise = service.approveSignature("signer", "data");

      await new Promise((resolve) =>
        setTimeout(() => {
          resolve(true);
        })
      );

      (service as any).resolverMap[tabId].resolve(sigResponse);
      const signature = await signaturePromise;

      expect(signature).toEqual(sigResponse);
    });

    it("should throw an error when popupTabId is not present", async () => {
      jest.spyOn(service as any, "getPopupTabId").mockResolvedValue(undefined);

      expect(service.approveSignature("signer", "data")).rejects.toBeDefined();
    });

    it("should throw an error when popupTabId is already in the map", async () => {
      const tabId = 1;
      const sigResponse = {
        hash: "hash",
        signature: "sig",
      };
      jest.spyOn(service as any, "getPopupTabId").mockResolvedValue(tabId);
      (service as any).resolverMap[tabId] = sigResponse;

      expect(service.approveSignature("signer", "data")).rejects.toBeDefined();
    });
  });

  describe("submitSignature", () => {
    it("should add popupTabId to resolverMap", async () => {
      const tabId = 1;
      const sigResponse = {
        hash: "hash",
        signature: "sig",
      };

      jest.spyOn(service as any, "getPopupTabId").mockResolvedValue(tabId);
      jest.spyOn(dataStore, "get").mockResolvedValueOnce("data");
      jest
        .spyOn(keyRingService, "signArbitrary")
        .mockResolvedValue(sigResponse);
      const signer = "signer";
      const signaturePromise = service.approveSignature(signer, "data");

      await new Promise((resolve) =>
        setTimeout(() => {
          resolve(true);
        })
      );
      await service.submitSignature(tabId, "msgId", signer);

      expect(await signaturePromise).toEqual(sigResponse);
    });

    it("should throw an error when resolvers are not present", async () => {
      const tabId = 1;
      const signer = "signer";
      jest.spyOn(dataStore, "get").mockResolvedValueOnce("data");

      expect(
        service.submitSignature(tabId, "msgId", signer)
      ).rejects.toBeDefined();
    });

    it("should throw an error when data is not present", async () => {
      const tabId = 1;
      const signer = "signer";
      const sigResponse = {
        hash: "hash",
        signature: "sig",
      };
      (service as any).resolverMap[tabId] = sigResponse;
      jest.spyOn(dataStore, "get").mockResolvedValueOnce(undefined);

      expect(
        service.submitSignature(tabId, "msgId", signer)
      ).rejects.toBeDefined();
    });

    it("should reject promise if can't sign", async () => {
      const tabId = 1;

      jest.spyOn(service as any, "getPopupTabId").mockResolvedValue(tabId);
      jest.spyOn(dataStore, "get").mockResolvedValueOnce("data");
      jest
        .spyOn(keyRingService, "signArbitrary")
        .mockRejectedValue("Can't sign");
      const signer = "signer";

      await new Promise((resolve) =>
        setTimeout(() => {
          resolve(true);
        })
      );

      expect(
        service.submitSignature(tabId, "msgId", signer)
      ).rejects.toBeDefined();
    });
  });

  describe("submitSignature", () => {
    it("should reject resolver", async () => {
      const tabId = 1;

      jest.spyOn(service as any, "getPopupTabId").mockResolvedValue(tabId);
      const signer = "signer";
      const signaturePromise = service.approveSignature(signer, "data");

      await new Promise((resolve) =>
        setTimeout(() => {
          resolve(true);
        })
      );
      await service.rejectSignature(tabId, "msgId");

      expect(signaturePromise).rejects.toEqual(undefined);
    });

    it("should throw an error if resolver is not found", async () => {
      const tabId = 1;

      expect(service.rejectSignature(tabId, "msgId")).rejects.toBeDefined();
    });
  });

  const txTypes = [
    [TxType.Bond, "getParamsBond"],
    [TxType.Unbond, "getParamsUnbond"],
    [TxType.Withdraw, "getParamsWithdraw"],
    [TxType.Transfer, "getParamsTransfer"],
    [TxType.IBCTransfer, "getParamsIbcTransfer"],
    [TxType.EthBridgeTransfer, "getParamsEthBridgeTransfer"],
    [TxType.VoteProposal, "getParamsVoteProposal"],
  ] as const;

  describe("approveTx", () => {
    it.each(txTypes)("should launch tx", async (type, paramsFn) => {
      jest.spyOn(ApprovalsService, paramsFn).mockImplementation(() => ({}));
      jest.spyOn(borsh, "deserialize").mockReturnValue({});
      jest.spyOn(service as any, "_launchApprovalWindow");

      expect(
        service.approveTx(type, "", "", AccountType.Mnemonic)
      ).resolves.not.toBeDefined();
    });
  });

  describe("getParamsTransfer", () => {
    it("should return transfer params", () => {
      const transferMsgValue = new TransferMsgValue({
        source: "source",
        target: "target",
        token: "token",
        amount: BigNumber(100),
        nativeToken: "nativeToken",
      });

      const txMsgValue = {
        token: "token",
        feeAmount: BigNumber(0.5),
        gasLimit: BigNumber(0.5),
        chainId: "chainId",
        publicKey: "publicKey",
      };

      jest.spyOn(borsh, "deserialize").mockReturnValue(transferMsgValue);

      const params = ApprovalsService.getParamsTransfer(
        new Uint8Array([]),
        txMsgValue
      );

      expect(params).toEqual({
        source: transferMsgValue.source,
        target: transferMsgValue.target,
        tokenAddress: transferMsgValue.token,
        amount: transferMsgValue.amount.toString(),
        publicKey: txMsgValue.publicKey,
        nativeToken: transferMsgValue.token,
      });
    });
  });

  describe("getParamsIbcTransfer", () => {
    it("should return transfer params", () => {
      const token: TokenInfo = {
        symbol: "symbol",
        type: 0,
        path: 0,
        coin: "coin",
        url: "url",
        address: "address",
      };

      const transferMsgValue = new IbcTransferMsgValue({
        source: "source",
        receiver: "target",
        token: token,
        amount: BigNumber(100),
        portId: "portId",
        channelId: "channelId",
      });

      const txMsgValue = {
        token: "token",
        feeAmount: BigNumber(0.5),
        gasLimit: BigNumber(0.5),
        chainId: "chainId",
        publicKey: "publicKey",
      };

      jest.spyOn(borsh, "deserialize").mockReturnValue(transferMsgValue);

      const params = ApprovalsService.getParamsIbcTransfer(
        new Uint8Array([]),
        txMsgValue
      );

      expect(params).toEqual({
        source: transferMsgValue.source,
        target: transferMsgValue.receiver,
        tokenAddress: transferMsgValue.token,
        amount: transferMsgValue.amount.toString(),
        publicKey: txMsgValue.publicKey,
        nativeToken: txMsgValue.token,
      });
    });
  });

  describe("getParamsEthBridgeTransfer", () => {
    it("should return transfer params", () => {
      const transferMsgValue = new EthBridgeTransferMsgValue({
        nut: false,
        asset: "asset",
        recipient: "recipient",
        sender: "sender",
        amount: BigNumber(100),
        feeAmount: BigNumber(0.5),
        feeToken: "feeToken",
      });

      const txMsgValue = {
        token: "token",
        feeAmount: BigNumber(0.5),
        gasLimit: BigNumber(0.5),
        chainId: "chainId",
        publicKey: "publicKey",
      };

      jest.spyOn(borsh, "deserialize").mockReturnValue(transferMsgValue);

      const params = ApprovalsService.getParamsEthBridgeTransfer(
        new Uint8Array([]),
        txMsgValue
      );

      expect(params).toEqual({
        source: transferMsgValue.sender,
        target: transferMsgValue.recipient,
        tokenAddress: transferMsgValue.asset,
        amount: transferMsgValue.amount.toString(),
        publicKey: txMsgValue.publicKey,
        nativeToken: txMsgValue.token,
      });
    });
  });

  describe("getParamsBond", () => {
    it("should return bond params", () => {
      const bondMsgValue = new SubmitBondMsgValue({
        source: "source",
        validator: "validator",
        amount: BigNumber(100),
        nativeToken: "nativeToken",
      });

      const txMsgValue = {
        token: "token",
        feeAmount: BigNumber(0.5),
        gasLimit: BigNumber(0.5),
        chainId: "chainId",
        publicKey: "publicKey",
      };

      jest.spyOn(borsh, "deserialize").mockReturnValue(bondMsgValue);

      const params = ApprovalsService.getParamsBond(
        new Uint8Array([]),
        txMsgValue
      );

      expect(params).toEqual({
        source: bondMsgValue.source,
        tokenAddress: bondMsgValue.nativeToken,
        amount: bondMsgValue.amount.toString(),
        publicKey: txMsgValue.publicKey,
        nativeToken: bondMsgValue.nativeToken,
      });
    });
  });

  describe("getParamsUnbond", () => {
    it("should return unbond params", () => {
      const unbondMsgValue = new SubmitUnbondMsgValue({
        source: "source",
        validator: "validator",
        amount: BigNumber(100),
      });

      const txMsgValue = {
        token: "token",
        feeAmount: BigNumber(0.5),
        gasLimit: BigNumber(0.5),
        chainId: "chainId",
        publicKey: "publicKey",
      };

      jest.spyOn(borsh, "deserialize").mockReturnValue(unbondMsgValue);

      const params = ApprovalsService.getParamsUnbond(
        new Uint8Array([]),
        txMsgValue
      );

      expect(params).toEqual({
        source: unbondMsgValue.source,
        amount: unbondMsgValue.amount.toString(),
        publicKey: txMsgValue.publicKey,
        nativeToken: txMsgValue.token,
      });
    });
  });

  describe("getParamsWithdraw", () => {
    it("should return withdraw params", () => {
      const withdrawMsgValue = new SubmitWithdrawMsgValue({
        source: "source",
        validator: "validator",
      });

      const txMsgValue = {
        token: "token",
        feeAmount: BigNumber(0.5),
        gasLimit: BigNumber(0.5),
        chainId: "chainId",
        publicKey: "publicKey",
      };

      jest.spyOn(borsh, "deserialize").mockReturnValue(withdrawMsgValue);

      const params = ApprovalsService.getParamsWithdraw(
        new Uint8Array([]),
        txMsgValue
      );

      expect(params).toEqual({
        source: withdrawMsgValue.source,
        validator: withdrawMsgValue.validator,
        publicKey: txMsgValue.publicKey,
        nativeToken: txMsgValue.token,
      });
    });
  });

  describe("getParamsVoteProposal", () => {
    it("should return vote proposal params", () => {
      const voteProposalMsgValue = new SubmitVoteProposalMsgValue({
        signer: "singer",
        proposalId: BigInt(0),
        vote: "yay",
      });

      const txMsgValue = {
        token: "token",
        feeAmount: BigNumber(0.5),
        gasLimit: BigNumber(0.5),
        chainId: "chainId",
        publicKey: "publicKey",
      };

      jest.spyOn(borsh, "deserialize").mockReturnValue(voteProposalMsgValue);

      const params = ApprovalsService.getParamsVoteProposal(
        new Uint8Array([]),
        txMsgValue
      );

      expect(params).toEqual({
        source: voteProposalMsgValue.signer,
        publicKey: txMsgValue.publicKey,
        nativeToken: txMsgValue.token,
      });
    });
  });

  describe("rejectTx", () => {
    it("should clear pending tx", async () => {
      jest.spyOn(service as any, "_clearPendingTx");
      await service.rejectTx("msgId");

      expect((service as any)._clearPendingTx).toHaveBeenCalledWith("msgId");
    });
  });
});
