import { chainTokensAtom } from "atoms/chain/atoms";
import {
  getDenomFromIbcTrace,
  ibcChannelsFamily,
  searchChainByDenom,
} from "atoms/integrations";
import { useAtomValue } from "jotai";

const Warning = ({
  trace,
  denom,
}: {
  trace: string;
  denom: string;
}): JSX.Element => {
  const chainName = searchChainByDenom(denom)?.chain_name ?? "";
  const { data: ibcChannels } = useAtomValue(ibcChannelsFamily(chainName));

  // skip the warning if it's the current open channel
  if (
    !ibcChannels?.namadaChannel ||
    trace.includes(ibcChannels.namadaChannel)
  ) {
    return <></>;
  }

  return <div className="text-xs text-neutral-500">inactive: {trace}</div>;
};

export const InactiveChannelWarning = ({
  address,
}: {
  address: string;
}): JSX.Element => {
  const chainTokens = useAtomValue(chainTokensAtom).data ?? [];

  const token = chainTokens.find((i) => i.address === address);
  if (!token || !("trace" in token)) {
    return <></>;
  }

  const denom = getDenomFromIbcTrace(token.trace);

  // search for other tokens that contains the same denom
  // if find one, but with different address, shows the warning
  for (let i = 0; i < chainTokens.length; i++) {
    const otherToken = chainTokens[i];
    if ("trace" in otherToken) {
      const otherDenom = getDenomFromIbcTrace(otherToken.trace);
      if (denom === otherDenom && token.address !== otherToken.address) {
        return <Warning trace={token.trace} denom={denom} />;
      }
    }
  }

  return <></>;
};
