import { Option } from "@namada/components";

/**
 * Supported testnet tokens
 */
export type FaucetToken = "NAM" | "BTC" | "ETH" | "DOT" | "Schnitzel" | "Apfel" | "Kartoffel";

/**
 * Token address defaults
 */
export const FaucetTokens: Record<FaucetToken, string> = {
  NAM: "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5",
  BTC: "atest1v4ehgw36xdzryve5gsc52veeg5cnsv2yx5eygvp38qcrvd29xy6rys6p8yc5xvp4xfpy2v694wgwcp",
  ETH: "atest1v4ehgw36xqmr2d3nx3ryvd2xxgmrq33j8qcns33sxezrgv6zxdzrydjrxveygd2yxumrsdpsf9jc2p",
  DOT: "atest1v4ehgw36gg6nvs2zgfpyxsfjgc65yv6pxy6nwwfsxgungdzrggeyzv35gveyxsjyxymyz335hur2jn",
  Schnitzel: "atest1v4ehgw36xue5xvf5xvuyzvpjx5un2v3k8qeyvd3cxdqns32p89rrxd6xx9zngvpegccnzs699rdnnt",
  Apfel: "atest1v4ehgw36gfryydj9g3p5zv3kg9znyd358ycnzsfcggc5gvecgc6ygs2rxv6ry3zpg4zrwdfeumqcz9",
  Kartoffel: "atest1v4ehgw36gep5ysecxq6nyv3jg3zygv3e89qn2vp48pryxsf4xpznvve5gvmy23fs89pryvf5a6ht90",
};

/**
 * Overrides specified in environment
 */
const {
  REACT_APP_TOKEN_NAM: tokenNam = FaucetTokens.NAM,
  REACT_APP_TOKEN_BTC: tokenBtc = FaucetTokens.BTC,
  REACT_APP_TOKEN_ETH: tokenEth = FaucetTokens.ETH,
  REACT_APP_TOKEN_DOT: tokenDot = FaucetTokens.DOT,
  REACT_APP_TOKEN_SCHNITZEL: tokenSchnitzel = FaucetTokens.Schnitzel,
  REACT_APP_TOKEN_APFEL: tokenApfel = FaucetTokens.Apfel,
  REACT_APP_TOKEN_KARTOFFEL: tokenKartoffel = FaucetTokens.Kartoffel,
} = process.env;

/**
 * Constant defining token data for select menu dropdown with 
 * any environment overrides applied
 */
export const TokenData: Option<string>[] = [
  {
    label: "NAM",
    value: tokenNam,
  },
  {
    label: "BTC",
    value: tokenBtc,
  },
  {
    label: "ETH",
    value: tokenEth,
  },
  {
    label: "DOT",
    value: tokenDot,
  },
  {
    label: "Schnitzel",
    value: tokenSchnitzel,
  },
  {
    label: "Apfel",
    value: tokenApfel,
  },
  {
    label: "Kartoffel",
    value: tokenKartoffel,
  }
];
