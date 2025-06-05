import { Parameters } from "@namada/indexer-client";
import { singleUnitDurationFromInterval } from "@namada/utils/helpers";
import { ibcChannelsFamily } from "atoms/integrations/atoms";
import {
  getDenomFromIbcTrace,
  searchChainByDenom,
} from "atoms/integrations/functions";
import { getDefaultStore } from "jotai";
import { chainTokensAtom } from "./atoms";

export const calculateUnbondingPeriod = (parameters: Parameters): string => {
  const unbondingPeriodInEpochs =
    Number(parameters.unbondingLength) +
    Number(parameters.pipelineLength) +
    Number(parameters.cubicSlashingWindowLength);
  const minEpochDuration = Number(parameters.minDuration);
  const maxBlockTime = Number(parameters.maxBlockTime);
  const epochSwitchBlocksDelay = Number(parameters.epochSwitchBlocksDelay);

  const realMinEpochDuration =
    minEpochDuration + maxBlockTime * epochSwitchBlocksDelay;

  return singleUnitDurationFromInterval(
    0,
    unbondingPeriodInEpochs * realMinEpochDuration
  );
};

export const isChannelInactive = (address: string): boolean => {
  const store = getDefaultStore();

  const chainTokens = store.get(chainTokensAtom).data ?? [];
  const token = chainTokens.find((i) => i.address === address);
  if (!token || !("trace" in token)) return false;
  const denom = getDenomFromIbcTrace(token?.trace ?? "");
  const chainName = searchChainByDenom(denom)?.chain_name ?? "";
  if (!chainName) return false;

  const { data: ibcChannels } = store.get(ibcChannelsFamily(chainName));
  // search for other tokens that contains the same denom
  // if find one, but with different address, shows the warning
  for (let i = 0; i < chainTokens.length; i++) {
    const otherToken = chainTokens[i];
    if ("trace" in otherToken) {
      const otherDenom = getDenomFromIbcTrace(otherToken.trace);
      if (denom === otherDenom && token.address !== otherToken.address) {
        if (
          !ibcChannels?.namadaChannel ||
          token.trace.includes(ibcChannels.namadaChannel)
        ) {
          return false;
        }
        return true;
      }
    }
  }

  return false;
};
