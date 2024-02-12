/* eslint-disable @typescript-eslint/no-explicit-any */
import { KeyRingService, TabStore } from "background/keyring";
import { LedgerService } from "background/ledger";
import { VaultService } from "background/vault";
import createMockInstance from "jest-create-mock-instance";
import { KVStoreMock } from "test/init";
import { ApprovalsService } from "./service";
import { ApprovedOriginsStore, TxStore } from "./types";

jest.mock("webextension-polyfill", () => ({
  runtime: {
    getURL: () => "url",
  },
}));

describe.only("approvals service", () => {
  let service: ApprovalsService;
  let keyRingService: jest.Mocked<KeyRingService>;
  let dataStore: KVStoreMock<string>;

  beforeEach(() => {
    jest.clearAllMocks();

    const txStore = new KVStoreMock<TxStore>("TxStore");
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
});
