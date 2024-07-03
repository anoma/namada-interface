import { DefaultApi } from "@anomaorg/namada-indexer-client";
import BigNumber from "bignumber.js";
import invariant from "invariant";
import { GasTable } from "types";
import { txKindFromIndexer } from "./atoms";

export const fetchGasLimit = async (api: DefaultApi): Promise<GasTable> => {
  const gasTableResponse = await api.apiV1GasTokenGet("native");
  const gasTable = gasTableResponse.data.reduce(
    (acc, { gasLimit, txKind: indexerTxKind }) => {
      const txKind = txKindFromIndexer(indexerTxKind);
      if (txKind) {
        const perKind = acc[txKind] || {};
        acc[txKind] = { ...perKind, native: new BigNumber(gasLimit) };
      }
      return acc;
    },
    {} as GasTable
  );

  return gasTable;
};

export const fetchMinimumGasPrice = async (
  api: DefaultApi,
  nativeToken: string
): Promise<BigNumber> => {
  const gasTableResponse = await api.apiV1GasPriceTokenGet(nativeToken);
  const nativeTokenCost = gasTableResponse.data.find(
    ({ token }) => token === nativeToken
  );
  invariant(!!nativeTokenCost, "Error querying minimum gas price");
  // TODO: this should be removed after indexer error is fixed!
  const asBigNumber = new BigNumber(nativeTokenCost.amount).dividedBy(100000);
  invariant(
    !asBigNumber.isNaN(),
    "Error converting minimum gas price to BigNumber"
  );
  return asBigNumber;
};
