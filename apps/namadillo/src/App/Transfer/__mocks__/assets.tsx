import { Asset } from "@chain-registry/types";

export const assetMock: Partial<Asset> = {
  name: "Ethereum",
  symbol: "ETH",
  logo_URIs: {
    svg: "https://example.com/eth-icon.png",
  },
};

export const assetMock2: Partial<Asset> = {
  name: "Bitcoin",
  symbol: "BTC",
  logo_URIs: { svg: "btc.svg" },
};

export const assetMockList: Array<Partial<Asset>> = [assetMock, assetMock2];

export const assetWithoutLogo: Partial<Asset> = { ...assetMock, logo_URIs: {} };
