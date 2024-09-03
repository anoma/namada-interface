import { DefaultApi, Parameters } from "@anomaorg/namada-indexer-client";

export const fetchRpcUrlFromIndexer = async (
  api: DefaultApi
): Promise<string> => {
  const rpcUrl = await api.apiV1ChainRpcUrlGet();
  return rpcUrl.data.url;
};

export const fetchChainParameters = async (
  api: DefaultApi
): Promise<Parameters> => {
  const parametersResponse = await api.apiV1ChainParametersGet();
  return parametersResponse.data;
};
