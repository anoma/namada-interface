import { Asset, AssetDenomUnit } from "@chain-registry/types";
import { ProposalStatus, ProposalTypeString } from "@namada/types";
import { localnetConfigAtom } from "atoms/integrations/atoms";
import BigNumber from "bignumber.js";
import { getDefaultStore } from "jotai";
import namadaAssets from "namada-chain-registry/namada/assetlist.json";
import { useEffect } from "react";

export const proposalStatusToString = (status: ProposalStatus): string => {
  const statusText: Record<ProposalStatus, string> = {
    pending: "Upcoming",
    ongoing: "Ongoing",
    passed: "Passed",
    rejected: "Rejected",
  };

  return statusText[status];
};

export const proposalTypeStringToString = (
  type: ProposalTypeString
): string => {
  const typeText: Record<ProposalTypeString, string> = {
    default: "Default",
    default_with_wasm: "Default with Wasm",
    pgf_steward: "PGF Steward",
    pgf_payment: "PGF Payment",
  };

  return typeText[type];
};

export const epochToString = (epoch: bigint): string =>
  `Epoch ${epoch.toString()}`;

export const proposalIdToString = (proposalId: bigint): string =>
  `#${proposalId.toString()}`;

export const useTransactionEventListener = <T extends keyof WindowEventMap>(
  event: T,
  handler: (this: Window, ev: WindowEventMap[T]) => void,
  deps: React.DependencyList = []
): void => {
  useEffect(() => {
    window.addEventListener(event, handler);
    return () => {
      window.removeEventListener(event, handler);
    };
  }, deps);
};

export const useTransactionEventListListener = <T extends keyof WindowEventMap>(
  events: T[],
  handler: (this: Window, ev: WindowEventMap[T]) => void,
  deps: React.DependencyList = []
): void => {
  useEffect(() => {
    events.forEach((event) => {
      window.addEventListener(event, handler);
    });
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handler);
      });
    };
  }, deps);
};

export const sumBigNumberArray = (numbers: BigNumber[]): BigNumber => {
  if (numbers.length === 0) return new BigNumber(0);
  return BigNumber.sum(...numbers);
};

const findDisplayUnit = (asset: Asset): AssetDenomUnit | undefined => {
  const { display, denom_units } = asset;
  return denom_units.find((unit) => unit.denom === display);
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const namadaAsset = () => {
  const store = getDefaultStore();
  const config = store.get(localnetConfigAtom);

  const configTokenAddress = config.data?.tokenAddress;
  const registryAsset = namadaAssets.assets[0];
  const asset =
    configTokenAddress ?
      {
        ...registryAsset,
        address: configTokenAddress,
      }
    : registryAsset;

  return asset satisfies Asset;
};

export const isNamadaAsset = (asset: Asset): boolean =>
  asset.symbol === namadaAsset().symbol;

export const toDisplayAmount = (
  asset: Asset,
  baseAmount: BigNumber
): BigNumber => {
  const displayUnit = findDisplayUnit(asset);
  if (!displayUnit) {
    return baseAmount;
  }
  return baseAmount.shiftedBy(-displayUnit.exponent);
};

export const toBaseAmount = (
  asset: Asset,
  displayAmount: BigNumber
): BigNumber => {
  const displayUnit = findDisplayUnit(asset);
  if (!displayUnit) {
    return displayAmount;
  }
  return displayAmount.shiftedBy(displayUnit.exponent);
};
