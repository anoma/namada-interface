const {
  REACT_APP_API_URL,
  REACT_APP_API_KEY = "",
  REACT_APP_API_TTL,
} = process.env;

const DEFAULT_TTL = 60; // One minute

const ApiConfig = {
  url: REACT_APP_API_URL || "https://api.coingecko.com/api/v3/",
  key: REACT_APP_API_KEY,
  cacheTTL: REACT_APP_API_TTL ? parseInt(REACT_APP_API_TTL) : DEFAULT_TTL,
};

export default ApiConfig;
