import { Asset, Chain } from "@chain-registry/types";
import { Bech32Config, ChainInfo, Currency } from "@keplr-wallet/types";
import tokenImage from "App/Common/assets/token.svg";
import {
  getKnownChains,
  getRestApiAddressByIndex,
  getRpcByIndex,
} from "atoms/integrations";
import BigNumber from "bignumber.js";
import { ChainId, ChainRegistryEntry, GasConfig } from "types";

type GasPriceStep = {
  low: number;
  average: number;
  high: number;
};

type GasPriceByDenom = Record<string, GasPriceStep>;

type CurrencyWithGasPriceStep = Currency & {
  gasPriceStep?: GasPriceStep;
};

export const findRegistryByChainId = (
  knownChains: Record<ChainId, ChainRegistryEntry>,
  chainId: string
): ChainRegistryEntry | undefined => {
  if (chainId in knownChains) {
    return knownChains[chainId];
  }
  return undefined;
};

export const findAssetByDenom = (denom: string): Asset | undefined => {
  const chainRegistry = getKnownChains();
  if (!chainRegistry) return undefined;

  for (const registry of chainRegistry) {
    const asset = registry.assets.assets.find((asset) => asset.base === denom);
    if (asset) return asset;
  }

  return undefined;
};

const getSvgOrPng = (image?: {
  svg?: string;
  png?: string;
}): string | undefined => {
  return image?.svg || image?.png;
};

export const getChainImageUrl = (chain?: Chain): string => {
  if (!chain) return tokenImage;
  return (
    getSvgOrPng(chain.images?.find((i) => i.theme?.circle)) ||
    getSvgOrPng(chain.images?.[0]) ||
    getSvgOrPng(chain.logo_URIs) ||
    tokenImage
  );
};

export const getAssetImageUrl = (asset?: Asset): string => {
  if (!asset) return tokenImage;
  return getSvgOrPng(asset.logo_URIs) || tokenImage;
};

export const getIbcGasConfig = (
  registry: ChainRegistryEntry,
  gasLimit: number = 222_000
): GasConfig | undefined => {
  // TODO: some chains support multiple fee tokens - what should we do?
  const feeToken = registry.chain.fees?.fee_tokens?.[0];
  const feeAsset = feeToken && findAssetByDenom(feeToken.denom);

  if (typeof feeToken !== "undefined" && feeAsset) {
    const gasPriceInBaseDenom =
      feeToken.average_gas_price ??
      feeToken.low_gas_price ??
      feeToken.fixed_min_gas_price ??
      feeToken.high_gas_price ??
      feeToken.gas_costs?.ibc_transfer ??
      feeToken.gas_costs?.cosmos_send ??
      0;

    return {
      gasPriceInMinDenom: BigNumber(gasPriceInBaseDenom),
      gasLimit: BigNumber(gasLimit),
      gasToken: feeToken.denom,
    };
  }
  return undefined;
};

export const assetsToKeplrCurrencies = (assets: Asset[]): Currency[] => {
  return assets.map((asset) => ({
    coinDenom: asset.symbol,
    coinMinimalDenom: asset.base,
    coinDecimals: asset.denom_units.filter(
      (denomUnit: { denom: string }) => denomUnit.denom === asset.display
    )[0]?.exponent,
    coinGeckoId: asset.coingecko_id || undefined,
    coinImageUrl: getAssetImageUrl(asset),
  }));
};

const mapGasPriceByDenom = ({ fees }: Chain): GasPriceByDenom =>
  fees?.fee_tokens?.reduce(
    (acc, { denom, low_gas_price, average_gas_price, high_gas_price }) => ({
      ...acc,
      [denom]: {
        low: low_gas_price ?? 0.01,
        average: average_gas_price ?? 0.025,
        high: high_gas_price ?? 0.04,
      },
    }),
    {} as GasPriceByDenom
  ) || {};

const generateBech32Config = (prefix: string): Bech32Config => {
  return {
    bech32PrefixAccAddr: prefix,
    bech32PrefixAccPub: `${prefix}pub`,
    bech32PrefixValAddr: `${prefix}valoper`,
    bech32PrefixValPub: `${prefix}valoperpub`,
    bech32PrefixConsAddr: `${prefix}valcons`,
    bech32PrefixConsPub: `${prefix}valconspub`,
  };
};

const getRelevantCurrencies = (
  currencies: Currency[],
  denoms: string[]
): Currency[] =>
  currencies.filter(({ coinMinimalDenom }) =>
    denoms.includes(coinMinimalDenom)
  );

const enhanceCurrencyWithGas = (
  gasPriceSteps: GasPriceByDenom,
  currency: Currency
): CurrencyWithGasPriceStep => {
  const gasPriceStep = gasPriceSteps[currency.coinMinimalDenom];
  return gasPriceStep ? { ...currency, gasPriceStep } : currency;
};

// Based on https://github.com/cosmology-tech/chain-registry/tree/main/v2/packages/keplr
// Following the structure described in https://docs.keplr.app/api/suggest-chain.html
export const basicConvertToKeplrChain = (
  chain: Chain,
  assets: Asset[]
): ChainInfo => {
  const currencies = assetsToKeplrCurrencies(assets);
  const gasPriceSteps = mapGasPriceByDenom(chain);

  const feeTokens = chain.fees?.fee_tokens.map(({ denom }) => denom) || [];

  const stakingTokens =
    chain.staking?.staking_tokens.map(({ denom }) => denom) || [];

  const stakeCurrency =
    currencies.find(({ coinDenom }) => stakingTokens.includes(coinDenom)) ||
    currencies[0];

  const feeCurrencies = getRelevantCurrencies(currencies, feeTokens).map(
    (currency) => enhanceCurrencyWithGas(gasPriceSteps, currency)
  );

  const defaultFeeCurrencies = [stakeCurrency].map((currency) =>
    enhanceCurrencyWithGas(gasPriceSteps, currency)
  );

  const rpc = getRpcByIndex(chain, 0);
  const rest = getRestApiAddressByIndex(chain, 0);

  return {
    chainId: chain.chain_id,
    chainName: chain.chain_name,
    rpc: rpc.address,
    rest,
    // TODO:
    bip44: { coinType: chain.slip44! },
    // TODO:
    bech32Config: generateBech32Config(chain.bech32_prefix!),
    currencies,
    stakeCurrency,
    feeCurrencies: feeCurrencies.length ? feeCurrencies : defaultFeeCurrencies,
  };
};
