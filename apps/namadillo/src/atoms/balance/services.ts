const apiUrl = "https://sqs.osmosis.zone/";

// ref: https://sqs.osmosis.zone/swagger/index.html#/default/get_tokens_prices
export const fetchCoinPrices = async (
  assetBaseList: string[]
): Promise<Record<string, { [usdcAddress: string]: string }>> =>
  fetch(`${apiUrl}/tokens/prices?base=${assetBaseList.join(",")}`).then((res) =>
    res.json()
  );
