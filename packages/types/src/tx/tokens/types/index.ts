import { RegisteredCoinType, registeredCoinTypes } from "slip44";

const {
  NAMADA_INTERFACE_NAMADA_TOKEN:
    nativeToken = "tnam1q8ctk7tr337f85dw69q0rsrggasxjjf5jq2s2wph",
} = process.env;

export type TokenInfo = {
  symbol: string;
  type: number;
  path: number;
  coin: string;
  url: string;
  address: string;
  nativeAddress?: string;
  isNut?: boolean;
  coinGeckoId?: string;
};

// Declare symbols for tokens we support:
// TODO: This will need to be refactored for mainnet!
export const Symbols = [
  "NAM",
  "BTC",
  "DOT",
  "ETH",
  "SCH",
  "APF",
  "KAR",
] as const;

export type TokenType = (typeof Symbols)[number];
type Tokens = Record<TokenType, TokenInfo>;

const supportedCoinTypes: RegisteredCoinType[] = [
  ...registeredCoinTypes.filter(([, , symbol]) => {
    return Symbols.indexOf(`${symbol as TokenType}`) > -1;
  }),
];

export const Tokens = supportedCoinTypes.reduce(
  (tokens: Tokens, coinType: RegisteredCoinType) => {
    const [type, path, symbol = "", coin, url = ""] = coinType;

    tokens[`${symbol as TokenType}`] = {
      address: "",
      type,
      path,
      symbol,
      coin,
      url,
    };

    return tokens;
  },
  {} as Tokens
);

// Map a few test addresses for now:
Tokens["NAM"] = {
  ...Tokens["NAM"],
  url: "https://namada.net",
  address: nativeToken,
  symbol: "Naan",
};

Tokens["DOT"] = {
  ...Tokens["DOT"],
  address: "tnam1qyfl072lhaazfj05m7ydz8cr57zdygk375jxjfwx",
  coinGeckoId: "polkadot",
};

Tokens["ETH"] = {
  ...Tokens["ETH"],
  address: "tnam1qxvnvm2t9xpceu8rup0n6espxyj2ke36yv4dw6q5",
  coinGeckoId: "ethereum",
};

Tokens["BTC"] = {
  ...Tokens["BTC"],
  address: "tnam1qy8qgxlcteehlk70sn8wx2pdlavtayp38vvrnkhq",
  coinGeckoId: "bitcoin",
};

Tokens["SCH"] = {
  ...Tokens["SCH"],
  coin: "Schnitzel",
  symbol: "SCH",
  address: "tnam1q9f5yynt5qfxe28ae78xxp7wcgj50fn4syetyrj6",
};

Tokens["APF"] = {
  ...Tokens["APF"],
  coin: "Apfel",
  symbol: "APF",
  address: "tnam1qyvfwdkz8zgs9n3qn9xhp8scyf8crrxwuq26r6gy",
};

Tokens["KAR"] = {
  ...Tokens["KAR"],
  coin: "Kartoffel",
  symbol: "KAR",
  address: "tnam1qyx93z5ma43jjmvl0xhwz4rzn05t697f3vfv8yuj",
};

export type TokenBalance = { token: TokenType; amount: string };
