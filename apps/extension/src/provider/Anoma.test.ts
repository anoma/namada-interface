/* eslint-disable @typescript-eslint/no-explicit-any */
import { toBase64 } from "@cosmjs/encoding";
import BigNumber from "bignumber.js";

import {
  AccountMsgSchema,
  AccountMsgValue,
  SubmitIbcTransferMsgSchema,
  IbcTransferMsgValue,
  IbcTransferProps,
  Message,
  SubmitTransferMsgSchema,
  TransferMsgValue,
  TransferProps,
  Chain,
  Anoma,
  AccountType,
} from "@anoma/types";

import { KVKeys } from "router";
import { init, KVStoreMock } from "test/init";
import { chains as defaultChains } from "@anoma/chains";
import { chain, keyStore, password, ACTIVE_ACCOUNT } from "./data.mock";
import {
  KeyRing,
  KeyRingService,
  KeyStore,
  KEYSTORE_KEY,
  PARENT_ACCOUNT_ID_KEY,
  UtilityStore,
} from "background/keyring";
import { Sdk } from "@anoma/shared";
import * as utils from "extension/utils";

// Needed for now as utils import webextension-polyfill directly
jest.mock("webextension-polyfill", () => ({}));

describe("Anoma", () => {
  let anoma: Anoma;
  let iDBStore: KVStoreMock<Chain[] | KeyStore[]>;
  let utilityStore: KVStoreMock<UtilityStore>;
  let keyRingService: KeyRingService;

  beforeAll(async () => {
    jest.spyOn(utils, "getAnomaRouterId").mockResolvedValue(1);
    ({ anoma, iDBStore, utilityStore, keyRingService } = await init());

    jest
      .spyOn(KeyRing.prototype, "checkPassword")
      .mockReturnValue(Promise.resolve(true));

    keyRingService.unlock(password);
  });

  afterAll(() => {
    keyRingService.lock();
  });

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
    iDBStore.set(KEYSTORE_KEY, keyStore);
    utilityStore.set(PARENT_ACCOUNT_ID_KEY, ACTIVE_ACCOUNT);
    const storedKeyStore = keyStore.map(
      ({ crypto: _crypto, ...account }) => account
    );
    const storedAccounts = await anoma.accounts(chain.chainId);

    expect(storedAccounts).toEqual(storedKeyStore);
  });

  it("should add a chain configuration", async () => {
    await anoma.suggestChain(chain);

    const chains = await iDBStore.get("chains");
    expect(chains?.pop()).toEqual(chain);
  });

  it.skip("should be able to submit a transfer to the approval process", async () => {
    const token =
      "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5";
    const transferProps: TransferProps = {
      tx: {
        token,
        feeAmount: new BigNumber(0),
        gasLimit: new BigNumber(0),
        chainId: chain.chainId,
      },
      source: keyStore[0].address,
      target:
        "atest1d9khqw36gdz5ydzygvcnyvesxgcn2s6zxyung3zzgcmrjwzzgvmnyd3kxym52vzzg5unxve5cm87cr",
      token,
      amount: new BigNumber(1000),
      nativeToken: token,
    };

    const transferMsgValue = new TransferMsgValue(transferProps);

    const transferMessage = new Message<TransferMsgValue>();
    const serializedTransfer = transferMessage.encode(
      SubmitTransferMsgSchema,
      transferMsgValue
    );

    jest.spyOn(keyRingService, "submitTransfer");
    anoma.submitTransfer({
      txMsg: toBase64(serializedTransfer),
      type: AccountType.PrivateKey,
    });

    expect(keyRingService.submitTransfer).toBeCalled();
  });

  it("should be able to submit an ibc transfer through the sdk", async () => {
    jest
      .spyOn(Sdk.prototype, "submit_ibc_transfer")
      .mockReturnValueOnce(Promise.resolve());

    const token =
      "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5";
    const transferProps: IbcTransferProps = {
      tx: {
        token,
        feeAmount: new BigNumber(0),
        gasLimit: new BigNumber(0),
        chainId: chain.chainId,
      },
      source: keyStore[0].address,
      receiver:
        "atest1d9khqw36gdz5ydzygvcnyvesxgcn2s6zxyung3zzgcmrjwzzgvmnyd3kxym52vzzg5unxve5cm87cr",
      token,
      amount: new BigNumber(1000),
      portId: "transfer",
      channelId: "channel-0",
    };

    const transferMsgValue = new IbcTransferMsgValue(transferProps);

    const transferMessage = new Message<IbcTransferMsgValue>();
    const serializedTransfer = transferMessage.encode(
      SubmitIbcTransferMsgSchema,
      transferMsgValue
    );

    const res = anoma.submitIbcTransfer(toBase64(serializedTransfer));

    await expect(res).resolves.not.toBeDefined();
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
        address: keyStore[0].address,
      })
    ).rejects.toThrow();
  });
});
