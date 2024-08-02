/* eslint-disable @typescript-eslint/no-explicit-any */
import { paramsToUrl } from "@namada/utils";
import { ChainsService } from "background/chains";
import { KeyRingService } from "background/keyring";
import { SdkService } from "background/sdk";
import { VaultService } from "background/vault";
import { ExtensionBroadcaster } from "extension";
import createMockInstance from "jest-create-mock-instance";
import { LocalStorage } from "storage";
import { KVStoreMock } from "test/init";
import * as webextensionPolyfill from "webextension-polyfill";
import { ApprovalsService } from "./service";
import { PendingTx } from "./types";

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
  "@heliax/namada-sdk/web-init",
  () => () =>
    Promise.resolve(
      jest.requireActual("@heliax/namada-sdk/node-init").default()
    )
);

describe("approvals service", () => {
  let service: ApprovalsService;
  let sdkService: jest.Mocked<SdkService>;
  let keyRingService: jest.Mocked<KeyRingService>;
  let chainService: jest.Mocked<ChainsService>;
  let dataStore: KVStoreMock<string>;
  let txStore: KVStoreMock<PendingTx>;
  let localStorage: LocalStorage;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    txStore = new KVStoreMock<PendingTx>("PendingTx");
    dataStore = new KVStoreMock<string>("DataStore");
    keyRingService = createMockInstance(KeyRingService as any);
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
      sdkService,
      keyRingService,
      vaultService,
      chainService,
      broadcaster
    );
  });

  describe("approveSignArbitrary", () => {
    it("should add popupTabId to resolverMap", async () => {
      const tabId = 1;
      const sigResponse = {
        hash: "hash",
        signature: "sig",
      };

      const signaturePromise = service.approveSignArbitrary("signer", "data");

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
        service.approveSignArbitrary("signer", "data")
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
        service.approveSignArbitrary("signer", "data")
      ).rejects.toBeDefined();
    });
  });

  describe("approveSignArbitrary", () => {
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
      const signaturePromise = service.approveSignArbitrary(signer, "data");

      await new Promise((resolve) =>
        setTimeout(() => {
          resolve(true);
        })
      );
      await service.submitSignArbitrary(tabId, "msgId", signer);

      expect(await signaturePromise).toEqual(sigResponse);
    });

    it("should throw an error when resolvers are not present", async () => {
      const tabId = 1;
      const signer = "signer";
      jest.spyOn(dataStore, "get").mockResolvedValueOnce("data");

      await expect(
        service.submitSignArbitrary(tabId, "msgId", signer)
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
        service.submitSignArbitrary(tabId, "msgId", signer)
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
        service.submitSignArbitrary(tabId, "msgId", signer)
      ).resolves.toBeUndefined();

      expect(service["resolverMap"][tabId].reject).toHaveBeenCalled();
    });
  });

  describe("approveSignTx", () => {
    it("should reject resolver", async () => {
      const tabId = 1;
      const signer = "signer";
      // data expected to be base64-encoded
      const txBytes = "dHhEYXRh"; // "txData"
      const signingDataBytes = "c2lnbmluZ0RhdGE="; // "signingData"

      (keyRingService.queryAccountDetails as any).mockResolvedValue(() => ({}));

      const signaturePromise = service.approveSignTx(signer, [
        {
          txBytes,
          signingDataBytes: [signingDataBytes],
        },
      ]);

      jest.spyOn(service as any, "_clearPendingTx");

      (webextensionPolyfill.windows.create as any).mockResolvedValue({
        tabs: [{ id: tabId }],
      });

      await new Promise((resolve) =>
        setTimeout(() => {
          resolve(true);
        })
      );

      // Reject the pending Tx
      await service.rejectSignTx(tabId, "msgId");

      // rejectSignTx should clear promise resolver for that msgId
      expect((service as any)._clearPendingTx).toHaveBeenCalledWith("msgId");

      await expect(signaturePromise).rejects.toBeDefined();
    });

    it("should throw an error if resolver is not found", async () => {
      const tabId = 1;
      await expect(service.rejectSignTx(tabId, "msgId")).rejects.toBeDefined();
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
