import { Option } from "@namada/components";

/**
 * Supported testnet tokens
 */
export type FaucetToken = "NAM";

/** Token address defaults
 */
export const FaucetTokens: Record<FaucetToken, string> = {
  NAM: "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5",
};

/**
 * Overrides specified in environment
 */
const { NAMADA_INTERFACE_TOKEN_NAM: tokenNam = FaucetTokens.NAM } = process.env;

/**
 * Constant defining token data for select menu dropdown with
 * any environment overrides applied
 */
export const TokenData: Option<string>[] = [
  {
    label: "NAM",
    value: tokenNam,
  },
];
