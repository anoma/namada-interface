declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      REACT_APP_LOCAL?: "true" | "false";

      // Default ledger
      REACT_APP_LEDGER_URL?: string;
      REACT_APP_LEDGER_PORT?: string;
      REACT_APP_CHAIN_ID?: string;
      REACT_APP_FAUCET?: string;

      // IBC Chain A
      REACT_APP_CHAIN_A_ALIAS?: string;
      REACT_APP_CHAIN_A_ID?: string;
      REACT_APP_CHAIN_A_URL?: string;
      REACT_APP_CHAIN_A_PORT?: string;
      REACT_APP_CHAIN_A_FAUCET?: string;
      REACT_APP_CHAIN_A_PORT_ID?: string;

      // IBC Chain B
      REACT_APP_CHAIN_B_ALIAS?: string;
      REACT_APP_CHAIN_B_ID?: string;
      REACT_APP_CHAIN_B_URL?: string;
      REACT_APP_CHAIN_B_PORT?: string;
      REACT_APP_CHAIN_B_FAUCET?: string;
      REACT_APP_CHAIN_B_PORT_ID?: string;

      // CoinGecko
      REACT_APP_API_URL?: string;
      REACT_APP_API_KEY?: string;
      REACT_APP_API_TTL?: string;
    }
  }
}

export {};
