import { DefaultApi } from "@anomaorg/namada-indexer-client";
import BigNumber from "bignumber.js";
import { ChainParameters } from "types";

export const fetchRpcUrlFromIndexer = async (
  api: DefaultApi
): Promise<string> => {
  const rpcUrl = await api.apiV1ChainRpcUrlGet();
  return rpcUrl.data.url;
};

export const fetchChainParameters = async (
  api: DefaultApi
): Promise<ChainParameters> => {
  const parametersResponse = await api.apiV1ChainParametersGet();
  const parameters = parametersResponse.data;
  return {
    unbondingPeriodInDays: BigInt(parameters.unbondingLength),
    apr: BigNumber(parameters.apr),
    chainId: parameters.chainId,
    nativeTokenAddress: parameters.nativeTokenAddress,
  };
};
