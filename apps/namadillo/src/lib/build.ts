import { Sdk } from "@heliax/namada-sdk/web";
import {
  Account,
  AccountType,
  TxMsgValue,
  TxProps,
  WrapperTxProps,
} from "@namada/types";
import { getIndexerApi } from "atoms/api";
import invariant from "invariant";
import { Address, ChainSettings, GasConfig } from "types";

export type EncodedTxData<T> = {
  type: string;
  txs: TxProps[] &
    {
      innerTxHashes: string[];
    }[];
  wrapperTxProps: WrapperTxProps;
  meta?: {
    props: T[];
  };
};

export const isPublicKeyRevealed = async (
  address: Address
): Promise<boolean> => {
  const api = getIndexerApi();
  console.log("address", address);
  let publicKey: string | undefined;
  try {
    publicKey = (await api.apiV1RevealedPublicKeyAddressGet(address)).data
      ?.publicKey;
    console.log("publicKey", publicKey);
  } catch {}
  return Boolean(publicKey);
};

const getTxProps = (
  account: Account,
  gasConfig: GasConfig,
  chain: ChainSettings
): WrapperTxProps => {
  invariant(
    !!account.publicKey,
    "Account doesn't contain a publicKey attached to it"
  );

  return {
    token: chain.nativeTokenAddress,
    feeAmount: gasConfig.gasPrice,
    gasLimit: gasConfig.gasLimit,
    chainId: chain.chainId,
    publicKey: account.publicKey!,
    memo: "",
  };
};

export const buildTx2 = async <T>(
  sdk: Sdk,
  account: Account,
  gasConfig: GasConfig,
  chain: ChainSettings,
  queryProps: T[],
  txFn: (wrapperTxProps: WrapperTxProps, props: T) => Promise<TxMsgValue>
): Promise<EncodedTxData<T>> => {
  const { tx } = sdk;
  const wrapperTxProps = getTxProps(account, gasConfig, chain);
  const txs: TxMsgValue[] = [];
  const txProps: TxProps[] = [];
  console.log("wrapperTxProps", wrapperTxProps);

  // Determine if RevealPK is needed:
  // const publicKeyRevealed = await isPublicKeyRevealed(account.address);
  // console.log("publicKeyRevealed", publicKeyRevealed, account.address);
  // if (!publicKeyRevealed) {
  //   const revealPkTx = await tx.buildRevealPk(wrapperTxProps);
  //   txs.push(revealPkTx);
  // }

  console.log("queryProps", queryProps);

  const encodedTxs = await Promise.all(
    queryProps.map((props) => txFn.apply(tx, [wrapperTxProps, props]))
  );
  console.log("encodedTxs", encodedTxs);

  txs.push(...encodedTxs);

  if (account.type === AccountType.Ledger) {
    txProps.push(...txs);
  } else {
    txProps.push(tx.buildBatch(txs));
  }

  return {
    txs: txProps.map(({ args, hash, bytes, signingData }) => {
      const innerTxHashes = tx.getInnerTxHashes(bytes);
      return {
        args,
        hash,
        bytes,
        signingData,
        innerTxHashes,
      };
    }),
    wrapperTxProps,
    type: txFn.name,
    meta: {
      props: queryProps,
    },
  };
};
