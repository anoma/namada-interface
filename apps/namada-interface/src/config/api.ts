const {
  NAMADA_INTERFACE_API_URL,
  NAMADA_INTERFACE_API_KEY = "",
  NAMADA_INTERFACE_API_TTL,
} = process.env;

const DEFAULT_TTL = 60; // One minute

const ApiConfig = {
  url: NAMADA_INTERFACE_API_URL || "https://api.coingecko.com/api/v3",
  key: NAMADA_INTERFACE_API_KEY,
  cacheTTL: NAMADA_INTERFACE_API_TTL ? parseInt(NAMADA_INTERFACE_API_TTL) : DEFAULT_TTL,
};

export default ApiConfig;
