declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      NAMADA_INTERFACE_LOCAL?: "true" | "false";
      NAMADA_INTERFACE_NAMADA_ALIAS?: string;
      NAMADA_INTERFACE_NAMADA_CHAIN_ID?: string;
      NAMADA_INTERFACE_NAMADA_URL?: string;
      NAMADA_INTERFACE_NAMADA_BECH32_PREFIX?: string;
      NAMADA_INTERFACE_NAMADA_FAUCET_ADDRESS?: string;
      NAMADA_INTERFACE_NAMADA_FAUCET_LIMIT?: string;
    }
  }
}

export {};
