import { Asset, Chain } from "@chain-registry/types";
import { Bech32Config, ChainInfo, Currency } from "@keplr-wallet/types";
import { getRestApiAddressByIndex, getRpcByIndex } from "atoms/integrations";

type GasPriceStep = {
  low: number;
  average: number;
  high: number;
};

type GasPriceByDenom = Record<string, GasPriceStep>;

type CurrencyWithGasPriceStep = Currency & {
  gasPriceStep?: GasPriceStep;
};

export const assetsToKeplrCurrencies = (assets: Asset[]): Currency[] => {
  return assets.map((asset) => ({
    coinDenom: asset.symbol,
    coinMinimalDenom: asset.base,
    coinDecimals: asset.denom_units.filter(
      (denomUnit: { denom: string }) => denomUnit.denom === asset.display
    )[0]?.exponent,
    coinGeckoId: asset.coingecko_id || undefined,
    coinImageUrl: asset.logo_URIs?.svg ?? asset.logo_URIs?.png,
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
    rpc,
    rest,
    bip44: { coinType: chain.slip44 },
    bech32Config: generateBech32Config(chain.bech32_prefix),
    currencies,
    stakeCurrency,
    feeCurrencies: feeCurrencies.length ? feeCurrencies : defaultFeeCurrencies,
  };
};