import { ChainKey } from "@namada/types";

const getProxyURL = (port: number): string => `http://localhost:${port}/proxy`;

// Define unique Proxy URLs for each chain:
export const ProxyMappings: Record<ChainKey, string> = {
  namada: getProxyURL(8010),
  cosmos: getProxyURL(8011),
  ethereum: getProxyURL(8012),
};
