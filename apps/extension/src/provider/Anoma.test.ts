/* eslint-disable @typescript-eslint/no-explicit-any */
import { deepMock } from "mockzilla";
import type { Browser } from "webextension-polyfill";
import { toBase64 } from "@cosmjs/encoding";

import {
  AccountMsgSchema,
  AccountMsgValue,
  IbcTransferMsgSchema,
  IbcTransferMsgValue,
  IbcTransferProps,
  Message,
  SubmitTransferMsgSchema,
  TransactionMsgSchema,
  TransactionMsgValue,
  TransferMsgValue,
  TransferProps,
  TxProps,
} from "@anoma/types";

import { KVKeys } from "router";
import { init } from "test/init";
import { chains as defaultChains } from "@anoma/chains";
import { chain, keyStore, NAM, password } from "./data.mock";
import { KeyRing, KEYSTORE_KEY } from "background/keyring";
import { Sdk } from "@anoma/shared";

// Needed for now as utils import webextension-polyfill directly
const [browser] = deepMock<Browser>("browser", false);
jest.mock("webextension-polyfill", () => browser);

describe("Anoma", () => {
  beforeAll(() => {
    jest
      .spyOn(KeyRing.prototype, "checkPassword")
      .mockReturnValue(Promise.resolve(true));

    keyRingService.unlock(password);
  });

  afterAll(() => {
    keyRingService.lock();
  });

  const { anoma, iDBStore, keyRingService } = init();

  it("should return chain by chainId", async () => {
    iDBStore.set(KVKeys.Chains, [chain]);
    const storedChain = await anoma.chain(chain.chainId);

    expect(storedChain).toEqual(chain);
  });

  it("should return all chains", async () => {
    iDBStore.set(KVKeys.Chains, [chain]);
    const storedChains = await anoma.chains();

    expect(storedChains).toEqual([...Object.values(defaultChains), chain]);
  });

  it("should return all accounts", async () => {
    iDBStore.set(KEYSTORE_KEY, [keyStore]);
    const { crypto: _, ...storedKeyStore } = keyStore;

    const storedAccounts = await anoma.accounts(chain.chainId);

    expect(storedAccounts).toEqual([storedKeyStore]);
  });

  it("should add a chain configuration", async () => {
    await anoma.suggestChain(chain);

    const chains = await iDBStore.get("chains");
    expect(chains?.pop()).toEqual(chain);
  });

  it("should sign tx", async () => {
    jest
      .spyOn(KeyRing.prototype as any, "getPrivateKey")
      .mockReturnValueOnce(
        "1498b5467a63dffa2dc9d9e069caf075d16fc33fdd4c3b01bfadae6433767d93"
      );
    const txData = new Uint8Array([
      1, 40, 0, 0, 0, 67, 53, 70, 70, 50, 55, 50, 56, 66, 48, 56, 68, 67, 57,
      55, 66, 68, 66, 65, 55, 52, 67, 51, 67, 52, 52, 66, 54, 57, 65, 66, 66,
      56, 52, 54, 48, 53, 48, 53, 66, 1, 40, 0, 0, 0, 70, 70, 53, 69, 50, 66,
      55, 49, 68, 70, 69, 70, 67, 52, 54, 70, 66, 70, 51, 70, 70, 66, 67, 56,
      56, 56, 67, 51, 48, 56, 65, 70, 56, 66, 52, 57, 53, 48, 52, 51, 0, 40, 0,
      0, 0, 52, 66, 56, 56, 70, 66, 57, 49, 51, 65, 48, 55, 54, 54, 69, 51, 48,
      65, 48, 48, 66, 50, 70, 66, 56, 65, 65, 50, 57, 52, 57, 65, 55, 49, 48,
      69, 50, 52, 69, 54, 64, 66, 15, 0, 0, 0, 0, 0, 0, 0,
    ]);

    const txProps: TxProps = {
      signInner: true,
      token:
        "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5",
      epoch: 0,
      feeAmount: 10,
      gasLimit: 1000,
      txCode: new Uint8Array(),
    };

    const txMsg = new Message<TransactionMsgValue>();
    const txMsgValue = new TransactionMsgValue(txProps);
    const txMsgEncoded = txMsg.encode(TransactionMsgSchema, txMsgValue);

    await expect(
      anoma.signTx({
        signer: keyStore.address,
        txMsg: toBase64(txMsgEncoded),
        txData: toBase64(txData),
      })
    ).resolves.toBeDefined();
  });

  it("should be able to submit a transfer through the sdk", async () => {
    jest
      .spyOn(Sdk.prototype, "submit_transfer")
      .mockReturnValueOnce(Promise.resolve());

    const token =
      "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5";
    const transferProps: TransferProps = {
      tx: {
        token,
        feeAmount: 0,
        gasLimit: 0,
        txCode: new Uint8Array(),
      },
      source: keyStore.address,
      target:
        "atest1d9khqw36gdz5ydzygvcnyvesxgcn2s6zxyung3zzgcmrjwzzgvmnyd3kxym52vzzg5unxve5cm87cr",
      token,
      amount: 1000,
      nativeToken: token,
      txCode: new Uint8Array(),
    };

    const transferMsgValue = new TransferMsgValue(transferProps);

    const transferMessage = new Message<TransferMsgValue>();
    const serializedTransfer = transferMessage.encode(
      SubmitTransferMsgSchema,
      transferMsgValue
    );

    const res = anoma.submitTransfer(toBase64(serializedTransfer));

    await expect(res).resolves.not.toBeDefined();
  });

  it("should encode ibc transfer", async () => {
    const transferProps: IbcTransferProps = {
      sender: keyStore.address,
      receiver:
        "atest1d9khqw36gdz5ydzygvcnyvesxgcn2s6zxyung3zzgcmrjwzzgvmnyd3kxym52vzzg5unxve5cm87cr",
      token:
        "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5",
      amount: 1000,
      sourcePort: NAM.paths[0].portId,
      sourceChannel: NAM.paths[0].channelId,
    };

    const transferMsgValue = new IbcTransferMsgValue(transferProps);

    const transferMessage = new Message<IbcTransferMsgValue>();
    const serializedTransfer = transferMessage.encode(
      IbcTransferMsgSchema,
      transferMsgValue
    );

    await expect(
      anoma.encodeIbcTransfer(toBase64(serializedTransfer))
    ).resolves.toBeDefined();
  });

  // This test shows that init account is NOT working - it is also unused.
  // We will have to change assertion after fixing initAccount fn
  it("should THROW AN ERROR on encode init account", async () => {
    const accountMsgValue = new AccountMsgValue({
      vpCode: new Uint8Array(),
    });
    const accountMessage = new Message<AccountMsgValue>();
    const serialized = accountMessage.encode(AccountMsgSchema, accountMsgValue);

    await expect(
      anoma.encodeInitAccount({
        txMsg: toBase64(serialized),
        address: keyStore.address,
      })
    ).rejects.toThrow();
  });
});
