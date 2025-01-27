import {
  DefaultApi,
  GasEstimate,
  GasPriceTableInner,
} from "@namada/indexer-client";

export const fetchGasEstimate = async (
  api: DefaultApi,
  params: Parameters<typeof api.apiV1GasEstimateGet>
): Promise<GasEstimate> => {
  return (await api.apiV1GasEstimateGet(...params)).data;
};

export const fetchTokensGasPrice = async (
  api: DefaultApi
): Promise<GasPriceTableInner[]> => {
  return (await api.apiV1GasPriceGet()).data;
};
