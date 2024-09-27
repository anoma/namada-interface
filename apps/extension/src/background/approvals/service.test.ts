/* eslint-disable @typescript-eslint/no-explicit-any */
import { chains } from "@namada/chains";
import { WrapperTxMsgValue } from "@namada/types";
import { ChainsService } from "background/chains";
import { KeyRingService } from "background/keyring";
import { SdkService } from "background/sdk";
import { VaultService } from "background/vault";
import BigNumber from "bignumber.js";
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
  tabs: {
    onRemoved: {
      addListener: jest.fn(),
    },
  },
}));

jest.mock("@namada/utils", () => {
  return {
    ...jest.requireActual("@namada/utils"),
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
    keyRingService = createMockInstance(KeyRingService);
    const vaultService: jest.Mocked<VaultService> = createMockInstance(
      VaultService as any
    );
    chainService = createMockInstance(ChainsService);
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
      // tx bytes expected to be base64-encoded
      const bytes = "dHhEYXRh"; // "txData"

      (keyRingService.queryAccountDetails as any).mockResolvedValue(() => ({}));

      const signaturePromise = service.approveSignTx(signer, [
        {
          args: new WrapperTxMsgValue({
            token: "",
            feeAmount: BigNumber(0),
            gasLimit: BigNumber(0),
            chainId: "",
          }),
          hash: "",
          bytes,
          signingData: [],
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
      const interfaceOrigin = "origin";
      const chainId = chains.namada.chainId;
      const tabId = 1;

      jest.spyOn(service, "isConnectionApproved").mockResolvedValue(false);
      jest.spyOn(service as any, "launchApprovalPopup");
      service["resolverMap"] = {};

      const promise = service.approveConnection(interfaceOrigin, chainId);
      await new Promise<void>((r) =>
        setTimeout(() => {
          r();
        })
      );
      service["resolverMap"][tabId]?.resolve(true);

      expect(service["launchApprovalPopup"]).toHaveBeenCalledWith(
        "/approve-connection",
        { interfaceOrigin, chainId }
      );
      expect(service.isConnectionApproved).toHaveBeenCalledWith(
        interfaceOrigin,
        chainId
      );
      await expect(promise).resolves.toBeDefined();
    });

    it("should not approve connection if it was already approved", async () => {
      const interfaceOrigin = "origin";
      const chainId = "chainId";
      jest.spyOn(service, "isConnectionApproved").mockResolvedValue(true);

      await expect(
        service.approveConnection(interfaceOrigin, chainId)
      ).resolves.toBeUndefined();
    });
  });

  describe("approveConnectionResponse", () => {
    it("should approve connection response", async () => {
      const interfaceOrigin = "origin";
      const chainId = "chainId";
      const popupTabId = 1;
      service["resolverMap"] = {
        [popupTabId]: {
          resolve: jest.fn(),
          reject: jest.fn(),
        },
      };
      jest.spyOn(localStorage, "addApprovedOrigin").mockResolvedValue();

      await service.approveConnectionResponse(
        popupTabId,
        interfaceOrigin,
        chainId,
        true
      );

      expect(service["resolverMap"][popupTabId].resolve).toHaveBeenCalled();
      expect(localStorage.addApprovedOrigin).toHaveBeenCalledWith(
        interfaceOrigin
      );
    });

    it("should throw an error if resolvers are not found", async () => {
      const interfaceOrigin = "origin";
      const chainId = "chainId";
      const popupTabId = 1;

      await expect(
        service.approveConnectionResponse(
          popupTabId,
          interfaceOrigin,
          chainId,
          true
        )
      ).rejects.toBeDefined();
    });

    it("should reject the connection if allowConnection is set to false", async () => {
      const interfaceOrigin = "origin";
      const chainId = "chainId";
      const popupTabId = 1;
      service["resolverMap"] = {
        [popupTabId]: {
          resolve: jest.fn(),
          reject: jest.fn(),
        },
      };

      await service.approveConnectionResponse(
        popupTabId,
        interfaceOrigin,
        chainId,
        false
      );

      expect(service["resolverMap"][popupTabId].reject).toHaveBeenCalled();
    });
  });

  describe("approveDisconnection", () => {
    it("should approve disconnection if there is a connection already approved", async () => {
      const interfaceOrigin = "origin";
      const chainId = chains.namada.chainId;
      const tabId = 1;

      jest.spyOn(service, "isConnectionApproved").mockResolvedValue(true);
      jest.spyOn(service as any, "launchApprovalPopup");
      service["resolverMap"] = {};

      const promise = service.approveDisconnection(interfaceOrigin, chainId);
      await new Promise<void>((r) =>
        setTimeout(() => {
          r();
        })
      );
      service["resolverMap"][tabId]?.resolve(true);

      expect((service as any).launchApprovalPopup).toHaveBeenCalledWith(
        "/approve-disconnection",
        { interfaceOrigin }
      );
      expect(service.isConnectionApproved).toHaveBeenCalledWith(
        interfaceOrigin,
        chainId
      );
      await expect(promise).resolves.toBeDefined();
    });

    it("should not approve disconnection if it is NOT already approved", async () => {
      const interfaceOrigin = "origin";
      const chainId = "chainId";
      jest.spyOn(service, "isConnectionApproved").mockResolvedValue(false);

      await expect(
        service.approveDisconnection(interfaceOrigin, chainId)
      ).resolves.toBeUndefined();
    });
  });

  describe("approveDisconnectionResponse", () => {
    it("should approve disconnection response", async () => {
      const interfaceOrigin = "origin";
      const popupTabId = 1;
      service["resolverMap"] = {
        [popupTabId]: {
          resolve: jest.fn(),
          reject: jest.fn(),
        },
      };
      jest.spyOn(service, "revokeConnection").mockResolvedValue();

      await service.approveDisconnectionResponse(
        popupTabId,
        interfaceOrigin,
        true
      );

      expect(service["resolverMap"][popupTabId].resolve).toHaveBeenCalled();
      expect(service.revokeConnection).toHaveBeenCalledWith(interfaceOrigin);
    });

    it("should reject the connection if revokeConnection is set to false", async () => {
      const interfaceOrigin = "origin";
      const chainId = "chainId";
      const popupTabId = 1;
      service["resolverMap"] = {
        [popupTabId]: {
          resolve: jest.fn(),
          reject: jest.fn(),
        },
      };

      await service.approveConnectionResponse(
        popupTabId,
        interfaceOrigin,
        chainId,
        false
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

  describe("createPopup", () => {
    it("should create and return a new window", async () => {
      const url = "url";
      const window = { tabs: [{ id: 1 }] };
      (webextensionPolyfill.windows.create as any).mockResolvedValue(window);

      await expect(service["createPopup"](url)).resolves.toBe(window);
      expect(webextensionPolyfill.windows.create).toHaveBeenCalledWith(
        expect.objectContaining({ url })
      );
    });
  });

  describe("getPopupTabId", () => {
    it("should return tab id", async () => {
      const window = { tabs: [{ id: 1 }] } as any;
      expect(service["getPopupTabId"](window)).toBe(1);
    });

    it("should throw an error if tabs are undefined", async () => {
      const window = { tabs: undefined } as any;
      expect(() => service["getPopupTabId"](window)).toThrow();
    });

    it("should throw an error if tabs are empty", async () => {
      const window = { tabs: [] } as any;
      expect(() => service["getPopupTabId"](window)).toThrow();
    });

    it("should throw an error if the tab already exists on the resolverMap", async () => {
      const popupTabId = 1;
      const window = { tabs: [{ id: popupTabId }] } as any;
      service["resolverMap"] = {
        [popupTabId]: {
          resolve: jest.fn(),
          reject: jest.fn(),
        },
      };

      expect(() => service["getPopupTabId"](window)).toThrow();
    });
  });

  describe("launchApprovalPopup", () => {
    it("should create a window with the given route and params saving the resolver on the resolverMap", async () => {
      const route = "route";
      const params = { foo: "bar" };
      const popupTabId = 1;
      const window = { tabs: [{ id: popupTabId }] };

      jest
        .spyOn<any, any>(service, "createPopup")
        .mockImplementationOnce(() => window);

      void service["launchApprovalPopup"](route, params);

      expect(service["createPopup"]).toHaveBeenCalledWith(
        `url#${route}?foo=bar`
      );
      await new Promise<void>((r) => r());
      expect(service["resolverMap"][popupTabId]).toBeDefined();
    });
  });

  describe("getResolver", () => {
    it("should get the related tab id resolver from resolverMap", async () => {
      const popupTabId = 1;
      const resolver = { resolve: () => {}, reject: () => {} };
      service["resolverMap"] = {
        [popupTabId]: resolver,
      };

      expect(service["getResolver"](popupTabId)).toBe(resolver);
    });

    it("should throw an error if there is no resolver for the tab id", async () => {
      const popupTabId = 1;
      service["resolverMap"] = {
        [popupTabId]: { resolve: () => {}, reject: () => {} },
      };

      expect(() => service["getResolver"](999)).toThrow();
    });
  });

  describe("removeResolver", () => {
    it("should remove related tab id resolver from resolverMap", async () => {
      const popupTabId = 1;
      service["resolverMap"] = {
        [popupTabId]: { resolve: () => {}, reject: () => {} },
      };
      service["removeResolver"](popupTabId);

      expect(service["resolverMap"][popupTabId]).toBeUndefined();
    });
  });

  describe("isConnectionApproved", () => {
    it("should return true if origin is approved", async () => {
      const origin = "origin";
      const chainId = chains.namada.chainId;
      jest.spyOn(chainService, "getChain").mockResolvedValue(chains.namada);
      jest
        .spyOn(localStorage, "getApprovedOrigins")
        .mockResolvedValue([origin]);

      await expect(service.isConnectionApproved(origin, chainId)).resolves.toBe(
        true
      );
    });

    it("should return false if origin is not approved", async () => {
      const origin = "origin";
      const chainId = "chainId";
      jest.spyOn(chainService, "getChain").mockResolvedValue(chains.namada);
      jest.spyOn(localStorage, "getApprovedOrigins").mockResolvedValue([]);

      await expect(service.isConnectionApproved(origin, chainId)).resolves.toBe(
        false
      );
    });

    it("should return false if there are no origins in store", async () => {
      const origin = "origin";
      const chainId = "chainId";
      jest.spyOn(chainService, "getChain").mockResolvedValue(chains.namada);
      jest
        .spyOn(localStorage, "getApprovedOrigins")
        .mockResolvedValue(undefined);

      await expect(service.isConnectionApproved(origin, chainId)).resolves.toBe(
        false
      );
    });
  });
});
