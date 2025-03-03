const sqsOsmosisApi = "https://sqs.osmosis.zone";

// ref: https://sqs.osmosis.zone/swagger/index.html#/default/get_tokens_prices
export const fetchCoinPrices = async (
  assetBaseList: string[]
): Promise<Record<string, { [usdcAddress: string]: string }>> =>
  assetBaseList.length ?
    fetch(
      `${sqsOsmosisApi}/tokens/prices?base=${assetBaseList.sort((a, b) => a.localeCompare(b)).join(",")}`
    ).then((res) => res.json())
  : Promise.resolve({});
