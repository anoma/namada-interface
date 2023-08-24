declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      REACT_APP_LOCAL?: "true" | "false";

      REACT_APP_NAMADA_ALIAS?: string;
      REACT_APP_NAMADA_CHAIN_ID?: string;
      REACT_APP_NAMADA_URL?: string;
      REACT_APP_NAMADA_BECH32_PREFIX?: string;
      REACT_APP_NAMADA_FAUCET_ADDRESS?: string;
      REACT_APP_NAMADA_FAUCET_LIMIT?: string;

      REACT_APP_COSMOS_ALIAS?: string;
      REACT_APP_COSMOS_CHAIN_ID?: string;
      REACT_APP_COSMOS_CHAIN_URL?: string;

      REACT_APP_OSMOSIS_ALIAS?: string;
      REACT_APP_OSMOSIS_CHAIN_ID?: string;
      REACT_APP_OSMOSIS_URL?: string;

      // CoinGecko
      REACT_APP_API_URL?: string;
      REACT_APP_API_KEY?: string;
      REACT_APP_API_TTL?: string;
    }
  }
}

export { };
