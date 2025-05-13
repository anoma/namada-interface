import {
  DefaultApi,
  IbcToken,
  NativeToken,
  Parameters,
} from "@namada/indexer-client";
import { getDenomFromIbcTrace } from "atoms/integrations";
import BigNumber from "bignumber.js";
import { findAssetByDenom } from "integrations/utils";
import { MaspAssetRewards } from "types";
import { unknownAsset } from "utils/assets";
import { getSdkInstance } from "utils/sdk";

export const fetchRpcUrlFromIndexer = async (
  api: DefaultApi
): Promise<string> => {
  const rpcUrl = await api.apiV1ChainRpcUrlGet();
  return rpcUrl.data.url;
};

// TODO: We need the response type of this call updated in the indexer client
type TempChainParams = Parameters & {
  checksums: {
    current: Record<string, string>;
    fallback: Record<string, string>;
  };
};
export const fetchChainParameters = async (
  api: DefaultApi
): Promise<TempChainParams> => {
  const parametersResponse = await api.apiV1ChainParametersGet();
  return parametersResponse.data as TempChainParams;
};

export const fetchChainTokens = async (
  api: DefaultApi
): Promise<(NativeToken | IbcToken)[]> => {
  return (await api.apiV1ChainTokenGet()).data;
};

export const clearShieldedContext = async (chainId: string): Promise<void> => {
  const sdk = await getSdkInstance();
  await sdk.getMasp().clearShieldedContext(chainId);
};

export const fetchMaspRewards = async (): Promise<MaspAssetRewards[]> => {
  const sdk = await getSdkInstance();
  const rewards = await sdk.rpc.globalShieldedRewardForTokens();
  const existingRewards: MaspAssetRewards[] = rewards
    .filter((r) => r.maxRewardRate > 0)
    .map((r) => {
      const denom = getDenomFromIbcTrace(r.name);
      const asset = findAssetByDenom(denom) ?? unknownAsset(denom);
      return {
        asset,
        kdGain: new BigNumber(r.kdGain),
        kpGain: new BigNumber(r.kpGain),
        lockedAmountTarget: new BigNumber(r.lockedAmountTarget),
        maxRewardRate: new BigNumber(r.maxRewardRate),
      };
    });
  return existingRewards;
};
