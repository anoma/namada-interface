/* eslint-disable @typescript-eslint/no-explicit-any */
import TransportUSB from "@ledgerhq/hw-transport-webusb";
import * as LedgerNamadaNS from "@zondax/ledger-namada";
import * as LedgerNS from "../ledger";
import { Ledger, initLedgerUSBTransport } from "../ledger";

// Needed otherwise we can't redefine the classes from this module
jest.mock("@zondax/ledger-namada", () => {
  return {
    ...jest.requireActual("@zondax/ledger-namada"),
    NamadaApp: jest.fn(),
  };
});

describe("ledger", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initLedgerUSBTransport", () => {
    it("should initialize a Ledger USB transport", async () => {
      const returned = { usb: true };
      jest.spyOn(TransportUSB, "create").mockResolvedValue(returned as any);
      const res = await initLedgerUSBTransport();

      expect(TransportUSB.create).toHaveBeenCalled();
      expect(res).toEqual(returned);
    });
  });

  describe("Ledger", () => {
    describe("init", () => {
      it("should initialize a ledger with provided Transport", async () => {
        const transport = { transport: true };
        const namadaApp = { namadaApp: true };
        const ledger = { namadaApp };

        const NamadaAppSpy = jest
          .spyOn(LedgerNamadaNS, "NamadaApp")
          .mockReturnValue(namadaApp as any);

        const res = await Ledger.init(transport as any);

        expect(NamadaAppSpy).toHaveBeenCalledWith(transport);
        expect(res).toEqual(ledger);
      });
    });

    it("should initialize a ledger with usb transport if transport is not provided", async () => {
      const namadaApp = { namadaApp: true };
      const ledger = { namadaApp };
      const transport = { usb: true };

      const NamadaAppSpy = jest
        .spyOn(LedgerNamadaNS, "NamadaApp")
        .mockReturnValue(namadaApp as any);
      jest
        .spyOn(LedgerNS, "initLedgerUSBTransport")
        .mockResolvedValue(transport as any);

      const res = await Ledger.init();

      expect(NamadaAppSpy).toHaveBeenCalledWith(transport);
      expect(res).toEqual(ledger);
    });

    it("should throw an error when NamadaApp can't be created", async () => {
      const transport = { transport: true };
      const ConstructorError = "Constructor error";

      jest.spyOn(LedgerNamadaNS, "NamadaApp").mockImplementation(() => {
        throw new Error(ConstructorError);
      });

      await expect(
        async () => await Ledger.init(transport as any)
      ).rejects.toThrow(ConstructorError);
    });

    it("should throw an error when Ledger can't be created", async () => {
      const transport = { transport: true };
      const ConstructorError = "Constructor error";
      const testFN = Ledger.init;

      jest.spyOn(LedgerNS as any, "Ledger").mockImplementation(() => {
        throw new Error(ConstructorError);
      });

      await expect(async () => await testFN(transport as any)).rejects.toThrow(
        ConstructorError
      );
    });
  });

  describe("status", () => {
    it("should return the status of the ledger", async () => {
      const version = { version: "1.0.0" };
      const info = { info: "info" };
      const deviceId = "nanoSP";
      const deviceName = "Ledger Nano S+";

      const namadaApp = {
        getVersion: jest.fn().mockReturnValue(version),
        getAppInfo: jest.fn().mockReturnValue(info),
        transport: {
          deviceModel: { id: deviceId, productName: deviceName },
        },
      };
      const ledger: Ledger = new (Ledger as any)(namadaApp as any);

      const res = await ledger.status();

      expect(namadaApp.getVersion).toHaveBeenCalled();
      expect(namadaApp.getAppInfo).toHaveBeenCalled();
      expect(res).toEqual({ version, info, deviceId, deviceName });
    });
  });

  describe("getAddressAndPublicKey", () => {
    it("should return the address and public key of the ledger", async () => {
      const adrBuffer = Buffer.from([0x61, 0x64, 0x64, 0x72]); // "addr"
      const keyBuffer = Buffer.from([0x6b, 0x65, 0x79]); // "key"
      const namadaApp = {
        getAddressAndPubKey: jest.fn().mockReturnValue({
          address: adrBuffer,
          pubkey: keyBuffer,
        }),
      };
      const path = "path";

      const ledger: Ledger = new (Ledger as any)(namadaApp as any);
      const { address, publicKey } = await ledger.getAddressAndPublicKey(path);

      expect(namadaApp.getAddressAndPubKey).toHaveBeenCalledWith(path);
      expect(address).toEqual("addr");
      expect(publicKey).toEqual("key");
    });

    it("should return the address and public key of the ledger", async () => {
      const adrBuffer = Buffer.from([0x61, 0x64, 0x64, 0x72]); // "addr"
      const keyBuffer = Buffer.from([0x6b, 0x65, 0x79]); // "key"
      const namadaApp = {
        getAddressAndPubKey: jest.fn().mockReturnValue({
          address: adrBuffer,
          pubkey: keyBuffer,
        }),
      };

      const ledger: Ledger = new (Ledger as any)(namadaApp as any);
      await ledger.getAddressAndPublicKey();

      expect(namadaApp.getAddressAndPubKey).toHaveBeenCalledWith(
        LedgerNS.DEFAULT_LEDGER_BIP44_PATH
      );
    });
  });

  describe("showAddressAndPublicKey", () => {
    it("should return the address and public key of the ledger", async () => {
      const adrBuffer = Buffer.from([0x61, 0x64, 0x64, 0x72]); // "addr"
      const keyBuffer = Buffer.from([0x6b, 0x65, 0x79]); // "key"
      const namadaApp = {
        showAddressAndPubKey: jest.fn().mockReturnValue({
          address: adrBuffer,
          pubkey: keyBuffer,
        }),
      };
      const path = "path";

      const ledger: Ledger = new (Ledger as any)(namadaApp as any);
      const { address, publicKey } = await ledger.showAddressAndPublicKey(path);

      expect(namadaApp.showAddressAndPubKey).toHaveBeenCalledWith(path);
      expect(address).toEqual("addr");
      expect(publicKey).toEqual("key");
    });

    it("should throw an error when the ledger can't show the address and public key", async () => {
      const innerError = "Inner error";
      const namadaApp = {
        showAddressAndPubKey: jest.fn().mockImplementation(() => {
          throw new Error(innerError);
        }),
      };
      const ledger: Ledger = new (Ledger as any)(namadaApp as any);

      await expect(
        async () => await ledger.showAddressAndPublicKey()
      ).rejects.toThrow(
        `Connect Ledger rejected by user: ${new Error(innerError)}`
      );
    });
  });

  describe("sign", () => {
    it("should sign the transaction with the ledger", async () => {
      const tx = new Uint8Array([0x01, 0x02, 0x03]);
      const path = "path";
      const namadaApp = {
        sign: jest.fn().mockReturnValue({ signature: "signature" }),
      };

      const ledger: Ledger = new (Ledger as any)(namadaApp as any);
      const sig = await ledger.sign(tx, path);

      expect(namadaApp.sign).toHaveBeenCalledWith(path, Buffer.from(tx));
      expect(sig).toEqual({ signature: "signature" });
    });

    it("should sign the transaction with the ledger using the default path", async () => {
      const tx = new Uint8Array([0x01, 0x02, 0x03]);
      const namadaApp = {
        sign: jest.fn().mockReturnValue({ signature: "signature" }),
      };

      const ledger: Ledger = new (Ledger as any)(namadaApp as any);
      await ledger.sign(tx);

      expect(namadaApp.sign).toHaveBeenCalledWith(
        LedgerNS.DEFAULT_LEDGER_BIP44_PATH,
        Buffer.from(tx)
      );
    });
  });

  describe("queryErrors", () => {
    it("should query the errors of the ledger", async () => {
      const namadaApp = {};
      const errorMessage = "error";
      const ledger: Ledger = new (Ledger as any)(namadaApp as any);

      jest.spyOn(ledger, "status").mockResolvedValue({
        info: { returnCode: 1, errorMessage },
      } as any);

      const res = await ledger.queryErrors();

      expect(res).toEqual(errorMessage);
    });

    it("should return empty string if there are no errors", async () => {
      const namadaApp = {};
      const errorMessage = "error";
      const ledger: Ledger = new (Ledger as any)(namadaApp as any);

      jest.spyOn(ledger, "status").mockResolvedValue({
        info: { returnCode: LedgerNamadaNS.LedgerError.NoErrors, errorMessage },
      } as any);

      const res = await ledger.queryErrors();

      expect(res).toEqual("");
    });
  });

  describe("closeTransport", () => {
    it("should close the transport of the ledger", async () => {
      const namadaApp = {
        transport: { close: jest.fn() },
      };
      const ledger: Ledger = new (Ledger as any)(namadaApp as any);

      await ledger.closeTransport();

      expect(namadaApp.transport.close).toHaveBeenCalled();
    });
  });
});
