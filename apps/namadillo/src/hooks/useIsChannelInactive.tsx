import { chainTokensAtom } from "atoms/chain/atoms";
import {
  getDenomFromIbcTrace,
  ibcChannelsFamily,
  searchChainByDenom,
} from "atoms/integrations";
import { useAtomValue } from "jotai";

export const useIsChannelInactive = (
  address: string
): { isInactive: boolean; trace: string } => {
  const chainTokens = useAtomValue(chainTokensAtom).data ?? [];
  const token = chainTokens.find((i) => i.address === address);
  const hasTrace = token && "trace" in token;
  const denom = getDenomFromIbcTrace(hasTrace ? token.trace : "");
  const chainName = searchChainByDenom(denom)?.chain_name;
  const { data: ibcChannels } = useAtomValue(ibcChannelsFamily(chainName));

  if (!chainName || !hasTrace || !ibcChannels)
    return { isInactive: false, trace: "" };

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
          return { isInactive: false, trace: "" };
        }
        return { isInactive: true, trace: token.trace };
      }
    }
  }

  return { isInactive: false, trace: "" };
};
