/* eslint-disable @typescript-eslint/no-explicit-any */
import * as borsh from "@dao-xyz/borsh";
import { TxType } from "@namada/sdk/web";
import {
  AccountType,
  BondMsgValue,
  EthBridgeTransferMsgValue,
  IbcTransferMsgValue,
  TokenInfo,
  TransferMsgValue,
  UnbondMsgValue,
  VoteProposalMsgValue,
  WithdrawMsgValue,
} from "@namada/types";
import { paramsToUrl } from "@namada/utils";
import { KeyRingService } from "background/keyring";
import { LedgerService } from "background/ledger";
import { VaultService } from "background/vault";
import BigNumber from "bignumber.js";
import { ExtensionBroadcaster } from "extension";
import createMockInstance from "jest-create-mock-instance";
import { LocalStorage } from "storage";
import { KVStoreMock } from "test/init";
import * as webextensionPolyfill from "webextension-polyfill";
import { ApprovalsService } from "./service";
import { TxStore } from "./types";

jest.mock("webextension-polyfill", () => ({
  runtime: {
    getURL: () => "url",
  },
  windows: {
    create: jest.fn().mockResolvedValue({ tabs: [{ id: 1 }] }),
  },
}));

jest.mock("@namada/utils", () => {
  return {
    ...jest.requireActual("@namada/utils"),
    paramsToUrl: jest.fn(),
    __esModule: true,
  };
});

// Because we run tests in node environment, we need to mock web-init as node-init
jest.mock(
  "@namada/sdk/web-init",
  () => () =>
    Promise.resolve(jest.requireActual("@namada/sdk/node-init").default())
);

describe("approvals service", () => {
  let service: ApprovalsService;
  let keyRingService: jest.Mocked<KeyRingService>;
  let dataStore: KVStoreMock<string>;
  let txStore: KVStoreMock<TxStore>;
  let localStorage: LocalStorage;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    txStore = new KVStoreMock<TxStore>("TxStore");
    dataStore = new KVStoreMock<string>("DataStore");
    keyRingService = createMockInstance(KeyRingService as any);
    const ledgerService: jest.Mocked<LedgerService> = createMockInstance(
      LedgerService as any
    );
    const vaultService: jest.Mocked<VaultService> = createMockInstance(
      VaultService as any
    );
    const broadcaster: jest.Mocked<ExtensionBroadcaster> =
      createMockInstance(ExtensionBroadcaster);
    localStorage = new LocalStorage(new KVStoreMock("LocalStorage"));

    service = new ApprovalsService(
      txStore,
      dataStore,
      localStorage,
      keyRingService,
      ledgerService,
      vaultService,
      broadcaster
    );
  });

  describe("approveSignature", () => {
    it("should add popupTabId to resolverMap", async () => {
      const tabId = 1;
      const sigResponse = {
        hash: "hash",
        signature: "sig",
      };

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
      (webextensionPolyfill.windows.create as any).mockResolvedValue({
        tabs: [],
      });

      await expect(
        service.approveSignature("signer", "data")
      ).rejects.toBeDefined();
    });

    it("should throw an error when popupTabId is already in the map", async () => {
      const tabId = 1;
      const sigResponse = {
        hash: "hash",
        signature: "sig",
      };
      (webextensionPolyfill.windows.create as any).mockResolvedValue({
        tabs: [{ id: tabId }],
      });
      (service as any).resolverMap[tabId] = sigResponse;

      await expect(
        service.approveSignature("signer", "data")
      ).rejects.toBeDefined();
    });
  });

  describe("submitSignature", () => {
    it("should add popupTabId to resolverMap", async () => {
      const tabId = 1;
      const sigResponse = {
        hash: "hash",
        signature: "sig",
      };

      (webextensionPolyfill.windows.create as any).mockResolvedValue({
        tabs: [{ id: tabId }],
      });
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

      await expect(
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

      await expect(
        service.submitSignature(tabId, "msgId", signer)
      ).rejects.toBeDefined();
    });

    it("should reject promise if can't sign", async () => {
      const tabId = 1;
      const error = "Can't sign";

      service["resolverMap"] = {
        [tabId]: { resolve: jest.fn(), reject: jest.fn() },
      };
      (webextensionPolyfill.windows.create as any).mockResolvedValue({
        tabs: [{ id: tabId }],
      });
      jest.spyOn(dataStore, "get").mockResolvedValueOnce("data");
      jest.spyOn(keyRingService, "signArbitrary").mockRejectedValue(error);

      const signer = "signer";

      await new Promise((resolve) =>
        setTimeout(() => {
          resolve(true);
        })
      );

      await expect(
        service.submitSignature(tabId, "msgId", signer)
      ).resolves.toBeUndefined();

      expect(service["resolverMap"][tabId].reject).toHaveBeenCalled();
    });
  });

  describe("submitSignature", () => {
    it("should reject resolver", async () => {
      const tabId = 1;
      const signer = "signer";
      const signaturePromise = service.approveSignature(signer, "data");

      (webextensionPolyfill.windows.create as any).mockResolvedValue({
        tabs: [{ id: tabId }],
      });

      await new Promise((resolve) =>
        setTimeout(() => {
          resolve(true);
        })
      );
      await service.rejectSignature(tabId, "msgId");

      await expect(signaturePromise).rejects.toBeUndefined();
    });

    it("should throw an error if resolver is not found", async () => {
      const tabId = 1;
      await expect(
        service.rejectSignature(tabId, "msgId")
      ).rejects.toBeDefined();
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
    it.each(txTypes)("%i txType fn: %s", async (type, paramsFn) => {
      jest.spyOn(ApprovalsService, paramsFn).mockImplementation(() => ({}));
      jest.spyOn(borsh, "deserialize").mockReturnValue({});
      jest.spyOn(service as any, "_launchApprovalWindow");

      try {
        const res = await service.approveTx(type, "", "", AccountType.Mnemonic);
        expect(res).toBeUndefined();
      } catch (e) {}
    });

    it("should throw an error if txType is not found", async () => {
      const type: any = 999;
      jest.spyOn(borsh, "deserialize").mockReturnValue({});

      await expect(
        service.approveTx(type, "", "", AccountType.Mnemonic)
      ).rejects.toBeDefined();
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
        minDenom: "minDenom",
        decimals: 0,
      };

      const transferMsgValue = new IbcTransferMsgValue({
        source: "source",
        receiver: "target",
        token: token.address,
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
      const bondMsgValue = new BondMsgValue({
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
      const unbondMsgValue = new UnbondMsgValue({
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
      const withdrawMsgValue = new WithdrawMsgValue({
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
      const voteProposalMsgValue = new VoteProposalMsgValue({
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

  const submitTxTypes = [
    [TxType.Bond, "submitBond"],
    [TxType.Unbond, "submitUnbond"],
    [TxType.Withdraw, "submitWithdraw"],
    [TxType.Transfer, "submitTransfer"],
    [TxType.IBCTransfer, "submitIbcTransfer"],
    [TxType.EthBridgeTransfer, "submitEthBridgeTransfer"],
    [TxType.VoteProposal, "submitVoteProposal"],
  ] as const;

  describe("submitTx", () => {
    it.each(submitTxTypes)("%i txType fn: %s", async (txType, paramsFn) => {
      const msgId = "msgId";
      const txMsg = "txMsg";
      const specificMsg = "specificMsg";

      jest.spyOn(service["txStore"], "get").mockImplementation(() => {
        return Promise.resolve({
          txType,
          txMsg,
          specificMsg,
        });
      });

      jest.spyOn(keyRingService, paramsFn).mockResolvedValue();
      jest.spyOn(service as any, "_clearPendingTx");

      await service.submitTx(msgId);
      expect(service["_clearPendingTx"]).toHaveBeenCalledWith(msgId);
      expect(keyRingService[paramsFn]).toHaveBeenCalledWith(
        specificMsg,
        txMsg,
        msgId
      );
    });

    it("should throw an error if txType is not found", async () => {
      const msgId = "msgId";
      const txMsg = "txMsg";
      const specificMsg = "specificMsg";
      const txType: any = 999;

      jest.spyOn(service["txStore"], "get").mockImplementation(() => {
        return Promise.resolve({
          txType,
          txMsg,
          specificMsg,
        });
      });

      await expect(service.submitTx(msgId)).rejects.toBeDefined();
    });

    it("should throw an error if tx is not found", async () => {
      jest.spyOn(service["txStore"], "get").mockImplementation(() => {
        return Promise.resolve(undefined);
      });

      await expect(service.submitTx("msgId")).rejects.toBeDefined();
    });
  });

  describe("approveConnection", () => {
    it("should approve connection if it's not already approved", async () => {
      const url = "url-with-params";
      const interfaceTabId = 999;
      const interfaceOrigin = "origin";
      const tabId = 1;

      (paramsToUrl as any).mockImplementation(() => url);
      jest.spyOn(service, "isConnectionApproved").mockResolvedValue(false);
      jest.spyOn(service as any, "_launchApprovalWindow").mockResolvedValue({
        tabs: [{ id: tabId }],
      });
      service["resolverMap"] = {};

      const promise = service.approveConnection(
        interfaceTabId,
        interfaceOrigin
      );
      await new Promise<void>((r) =>
        setTimeout(() => {
          r();
        })
      );
      service["resolverMap"][tabId]?.resolve(true);

      expect(paramsToUrl).toHaveBeenCalledWith("url#/approve-connection", {
        interfaceTabId: interfaceTabId.toString(),
        interfaceOrigin,
      });
      expect(service.isConnectionApproved).toHaveBeenCalledWith(
        interfaceOrigin
      );
      expect(service["_launchApprovalWindow"]).toHaveBeenCalledWith(url);
      await expect(promise).resolves.toBeDefined();
    });

    it("should not approve connection if it was already approved", async () => {
      const url = "url-with-params";
      const interfaceTabId = 999;
      const interfaceOrigin = "origin";
      (paramsToUrl as any).mockImplementation(() => url);
      jest.spyOn(service, "isConnectionApproved").mockResolvedValue(true);

      await expect(
        service.approveConnection(interfaceTabId, interfaceOrigin)
      ).resolves.toBeUndefined();
    });

    it("should throw an error when popupTabId is not found", async () => {
      const url = "url-with-params";
      const interfaceTabId = 999;
      const interfaceOrigin = "origin";

      (paramsToUrl as any).mockImplementation(() => url);
      jest.spyOn(service, "isConnectionApproved").mockResolvedValue(false);
      jest.spyOn(service as any, "_launchApprovalWindow").mockResolvedValue({
        tabs: [],
      });

      await expect(
        service.approveConnection(interfaceTabId, interfaceOrigin)
      ).rejects.toBeDefined();
    });

    it("should throw an error when popupTabId is found in resolverMap", async () => {
      const url = "url-with-params";
      const interfaceTabId = 999;
      const interfaceOrigin = "origin";
      const approvedOrigins = ["other-origin"];
      const tabId = 1;

      service["resolverMap"] = {
        [tabId]: {
          resolve: jest.fn(),
          reject: jest.fn(),
        },
      };

      (paramsToUrl as any).mockImplementation(() => url);
      jest
        .spyOn(localStorage, "getApprovedOrigins")
        .mockResolvedValue(approvedOrigins);
      jest.spyOn(service as any, "_launchApprovalWindow").mockResolvedValue({
        tabs: [{ id: tabId }],
      });

      await expect(
        service.approveConnection(interfaceTabId, interfaceOrigin)
      ).rejects.toBeDefined();
    });
  });

  describe("approveConnectionResponse", () => {
    it("should approve connection response", async () => {
      const interfaceTabId = 999;
      const interfaceOrigin = "origin";
      const popupTabId = 1;
      service["resolverMap"] = {
        [popupTabId]: {
          resolve: jest.fn(),
          reject: jest.fn(),
        },
      };
      jest.spyOn(localStorage, "addApprovedOrigin").mockResolvedValue();

      await service.approveConnectionResponse(
        interfaceTabId,
        interfaceOrigin,
        true,
        popupTabId
      );

      expect(service["resolverMap"][popupTabId].resolve).toHaveBeenCalled();
      expect(localStorage.addApprovedOrigin).toHaveBeenCalledWith(
        interfaceOrigin
      );
    });

    it("should throw an error if resolvers are not found", async () => {
      const interfaceTabId = 999;
      const interfaceOrigin = "origin";
      const popupTabId = 1;

      await expect(
        service.approveConnectionResponse(
          interfaceTabId,
          interfaceOrigin,
          true,
          popupTabId
        )
      ).rejects.toBeDefined();
    });

    it("should reject the connection if allowConnection is set to false", async () => {
      const interfaceTabId = 999;
      const interfaceOrigin = "origin";
      const popupTabId = 1;
      service["resolverMap"] = {
        [popupTabId]: {
          resolve: jest.fn(),
          reject: jest.fn(),
        },
      };

      await service.approveConnectionResponse(
        interfaceTabId,
        interfaceOrigin,
        false,
        popupTabId
      );

      expect(service["resolverMap"][popupTabId].reject).toHaveBeenCalled();
    });
  });

  describe("revokeConnection", () => {
    it("should reject connection response", async () => {
      const originToRevoke = "origin";

      jest.spyOn(localStorage, "removeApprovedOrigin").mockResolvedValue();
      await service.revokeConnection(originToRevoke);

      expect(localStorage.removeApprovedOrigin).toHaveBeenCalledWith(
        originToRevoke
      );
    });
  });

  describe("getPopupTabId", () => {
    it("should return tab id", async () => {
      (webextensionPolyfill.windows.create as any).mockResolvedValue({
        tabs: [{ id: 1 }],
      });

      await expect((service as any).getPopupTabId("url")).resolves.toBe(1);
    });

    it("should return undefined if tabs are undefined", async () => {
      (webextensionPolyfill.windows.create as any).mockResolvedValue({});

      await expect(
        (service as any).getPopupTabId("url")
      ).resolves.toBeUndefined();
    });

    it("should return undefined if tabs are empty", async () => {
      (webextensionPolyfill.windows.create as any).mockResolvedValue({
        tabs: [],
      });

      await expect(
        (service as any).getPopupTabId("url")
      ).resolves.toBeUndefined();
    });
  });

  describe("getTxDetails", () => {
    it("should return tx details", () => {
      const txMsgValue = {
        token: "token",
        feeAmount: BigNumber(0.5),
        gasLimit: BigNumber(0.5),
        chainId: "chainId",
        publicKey: "publicKey",
      };

      const { publicKey, nativeToken } = (ApprovalsService as any).getTxDetails(
        txMsgValue
      );

      expect(publicKey).toEqual(txMsgValue.publicKey);
      expect(nativeToken).toEqual(txMsgValue.token);
    });

    it("should return tx details with empty publicKey when missing", () => {
      const txMsgValue = {
        token: "token",
        feeAmount: BigNumber(0.5),
        gasLimit: BigNumber(0.5),
        chainId: "chainId",
      };

      const { publicKey, nativeToken } = (ApprovalsService as any).getTxDetails(
        txMsgValue
      );

      expect(publicKey).toEqual("");
      expect(nativeToken).toEqual(txMsgValue.token);
    });
  });

  describe("isConnectionApproved", () => {
    it("should return true if origin is approved", async () => {
      const origin = "origin";
      jest
        .spyOn(localStorage, "getApprovedOrigins")
        .mockResolvedValue([origin]);

      await expect(service.isConnectionApproved(origin)).resolves.toBe(true);
    });

    it("should return false if origin is not approved", async () => {
      const origin = "origin";
      jest.spyOn(localStorage, "getApprovedOrigins").mockResolvedValue([]);

      await expect(service.isConnectionApproved(origin)).resolves.toBe(false);
    });

    it("should return false if there are no origins in store", async () => {
      const origin = "origin";
      jest
        .spyOn(localStorage, "getApprovedOrigins")
        .mockResolvedValue(undefined);

      await expect(service.isConnectionApproved(origin)).resolves.toBe(false);
    });
  });
});
