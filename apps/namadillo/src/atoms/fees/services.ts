import { DefaultApi } from "@namada/indexer-client";
import { mapUndefined } from "@namada/utils";
import BigNumber from "bignumber.js";
import invariant from "invariant";
import { GasTable } from "types";
import { txKinds } from "types/txKind";
import { namadaAsset, toDisplayAmount } from "utils";
import { txKindToIndexer } from "./functions";

export const fetchGasLimit = async (api: DefaultApi): Promise<GasTable> => {
  const gasTableResponse = await api.apiV1GasGet();

  return txKinds.reduce((acc, txKind) => {
    const indexerTxKind = txKindToIndexer(txKind);
    const gasLimit = gasTableResponse.data.find(
      (entry) => entry.txKind === indexerTxKind
    )?.gasLimit;
    const maybeBigNumber = mapUndefined(BigNumber, gasLimit);

    if (typeof maybeBigNumber === "undefined" || maybeBigNumber.isNaN()) {
      throw new Error("Couldn't decode gas table");
    } else {
      return { ...acc, [txKind]: { native: maybeBigNumber } };
    }
  }, {} as GasTable);
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
  const asBigNumber = toDisplayAmount(
    namadaAsset(),
    BigNumber(nativeTokenCost.minDenomAmount)
  );
  invariant(
    !asBigNumber.isNaN(),
    "Error converting minimum gas price to BigNumber"
  );
  return asBigNumber;
};
