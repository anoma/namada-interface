const apiUrl = "https://api-osmosis.imperator.co";

type ImperatorToken = {
  price: number;
  denom: string;
  symbol: string;
  liquidity: number;
  volume_24h: number;
  volume_24h_change: number;
  name: string;
  price_24h_change: number;
  price_7d_change: number;
  exponent: number;
  display: string;
};

export const fetchTokenPrices = async (): Promise<ImperatorToken[]> =>
  fetch(`${apiUrl}/tokens/v2/all`).then((res) => res.json());
