import cosmoshub from "./cosmoshub.json";
import namada from "./namada.json";

type MinimalDenom = string;
type ConfigName = string;
type ChainName = "cosmoshub" | "namada";
type ChainMinDenom = "uatom" | "namnam";

type Currency = {
  coinDecimals: number;
  coinDenom: string;
  coinMinimalDenom: string;
};

export type ChainConfig = {
  currencies: Currency[];
  feeCurrencies: Currency[];
  stakeCurrency: Currency;
};

const loadedConfigs: ChainConfig[] = [];
const minimalDenomMap: Map<string, number> = new Map();
const nameMap: Map<string, number> = new Map();

export function chainConfigByMinDenom(minDenom: ChainMinDenom): ChainConfig {
  const index = minimalDenomMap.get(minDenom);
  if (typeof index === "undefined") {
    throw new Error("Chain config not found");
  }

  return loadedConfigs[index];
}

export function chainConfigByName(name: ChainName): ChainConfig {
  const index = nameMap.get(name);
  if (typeof index === "undefined") {
    throw new Error("Chain config not found");
  }
  return loadedConfigs[index];
}

function loadConfigs(configs: [MinimalDenom, ConfigName, ChainConfig][]): void {
  configs.forEach(([minimalDenom, name, config], index) => {
    loadedConfigs.push(config);

    minimalDenomMap.set(minimalDenom, index);
    nameMap.set(name, index);
  });
}

loadConfigs([
  ["namnam", "namada", namada],
  ["uatom", "cosmoshub", cosmoshub],
]);
