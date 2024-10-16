import { Asset, Chain } from "@chain-registry/types";
import { Bech32Config, ChainInfo, Currency } from "@keplr-wallet/types";
import { getRestApiAddressByIndex, getRpcByIndex } from "atoms/integrations";

type GasPriceStep = {
  low: number;
  average: number;
  high: number;
};

type GasPriceByDenom = Record<string, GasPriceStep>;

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

const mapGasPriceByDenom = (chain: Chain): GasPriceByDenom => {
  return (
    chain.fees?.fee_tokens?.reduce((m, feeToken) => {
      return {
        ...m,
        [feeToken.denom]: {
          low: feeToken.low_gas_price ?? 0.01,
          average: feeToken.average_gas_price ?? 0.025,
          high: feeToken.high_gas_price ?? 0.04,
        },
      };
    }, {} as GasPriceByDenom) || {}
  );
};

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

// Based on https://github.com/cosmology-tech/chain-registry/tree/main/v2/packages/keplr
// Following the structure described in https://docs.keplr.app/api/suggest-chain.html
export const basicConvertToKeplrChain = (
  chain: Chain,
  assets: Asset[]
): ChainInfo => {
  const currencies = assetsToKeplrCurrencies(assets);
  const gasPriceSteps: GasPriceByDenom = mapGasPriceByDenom(chain);
  const stakingDenoms =
    chain.staking?.staking_tokens.map((stakingToken) => stakingToken.denom) ||
    [];

  const feeDenoms: string[] =
    chain.fees?.fee_tokens.map((feeToken) => feeToken.denom) || [];

  const stakeCurrency =
    currencies.find((currency) => stakingDenoms.includes(currency.coinDenom)) ??
    currencies[0];

  const feeCurrencies: Currency[] = currencies
    .filter((currency) => feeDenoms.includes(currency.coinMinimalDenom))
    .map((feeCurrency) => {
      if (!(feeCurrency.coinMinimalDenom in gasPriceSteps)) {
        return feeCurrency;
      }
      const gasPriceStep = gasPriceSteps[feeCurrency.coinMinimalDenom];
      return {
        ...feeCurrency,
        gasPriceStep,
      };
    });

  const feeCurrenciesDefault: Currency[] = currencies
    .filter((currency) => stakeCurrency.coinDenom === currency.coinDenom)
    .map((feeCurrency) => {
      if (!(feeCurrency.coinMinimalDenom in gasPriceSteps)) {
        return feeCurrency;
      }
      // has gas
      const gasPriceStep = gasPriceSteps[feeCurrency.coinMinimalDenom];
      return {
        ...feeCurrency,
        gasPriceStep,
      };
    });

  const rpc = getRpcByIndex(chain, 0);
  const rest = getRestApiAddressByIndex(chain, 0);
  return {
    chainId: chain.chain_id,
    chainName: chain.chain_name,
    rpc,
    rest,
    bip44: {
      coinType: chain.slip44,
    },
    bech32Config: generateBech32Config(chain.bech32_prefix),
    currencies,
    stakeCurrency,
    feeCurrencies:
      feeCurrencies.length !== 0 ? feeCurrencies : feeCurrenciesDefault,
  };
};
