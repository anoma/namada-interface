import { Balance } from "@namada/sdk/web";
import { getSdkInstance } from "utils/sdk";

const sqsOsmosisApi = "https://sqs.osmosis.zone";

// ref: https://sqs.osmosis.zone/swagger/index.html#/default/get_tokens_prices
export const fetchCoinPrices = async (
  assetBaseList: string[]
): Promise<Record<string, { [usdcAddress: string]: string }>> =>
  assetBaseList.length ?
    fetch(
      `${sqsOsmosisApi}/tokens/prices?base=${assetBaseList.sort((a, b) => a.localeCompare(b)).join(",")}`
    ).then((res) => res.json())
  : [];

export const fetchShieldedBalance = async (
  viewingKey: string,
  addresses: string[]
): Promise<Balance> => {
  // TODO mock shielded balance
  // return await mockShieldedBalance(viewingKey);

  const sdk = await getSdkInstance();
  await sdk.rpc.shieldedSync([viewingKey]);
  return await sdk.rpc.queryBalance(viewingKey, addresses);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockShieldedBalance = async (viewingKey: string): Promise<Balance> => {
  await new Promise((r) => setTimeout(() => r(0), 500));
  getSdkInstance().then((sdk) => sdk.rpc.shieldedSync([viewingKey]));
  return [
    ["tnam1qy440ynh9fwrx8aewjvvmu38zxqgukgc259fzp6h", "37"], // nam
    ["tnam1p5nnjnasjtfwen2kzg78fumwfs0eycqpecuc2jwz", "1"], // uatom
  ];
};
