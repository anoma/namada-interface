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
    epochInfo: {
      unbondingPeriodInEpochs:
        Number(parameters.unbondingLength) +
        Number(parameters.pipelineLength) +
        // + 1 because we unbonding period starts from the next epoch
        1,
      minEpochDuration: Number(parameters.minDuration),
      minNumOfBlocks: Number(parameters.minNumOfBlocks),
      maxBlockTime: Number(parameters.maxBlockTime),
      epochSwitchBlocksDelay: Number(parameters.epochSwitchBlocksDelay),
    },
    apr: BigNumber(parameters.apr),
    chainId: parameters.chainId,
    nativeTokenAddress: parameters.nativeTokenAddress,
    checksums: parameters.checksums,
  };
};
