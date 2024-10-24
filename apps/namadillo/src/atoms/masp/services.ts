const apiUrl = "https://api.coingecko.com/api/v3/";
const apiKey = process.env.COIN_GECKO_API_KEY ?? "";
const apiKeyParam = `x_cg_demo_api_key=${apiKey}`;

export const fetchCoinPrices = async (
  ids: string[]
): Promise<Record<string, { usd: number }>> =>
  fetch(
    `${apiUrl}/simple/price?ids=${ids}&vs_currencies=usd&${apiKeyParam}`
  ).then((res) => res.json());
