import { Asset, AssetDenomUnit } from "@chain-registry/types";
import { ProposalStatus, ProposalTypeString } from "@namada/types";
import BigNumber from "bignumber.js";
import * as fns from "date-fns";
import { DateTime } from "luxon";
import internalDevnetAssets from "namada-chain-registry/namadainternaldevnet/assetlist.json";
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

const secondsToDateTime = (seconds: bigint): DateTime =>
  DateTime.fromSeconds(Number(seconds));

export const secondsToTimeString = (seconds: bigint): string =>
  secondsToDateTime(seconds).toLocaleString(DateTime.TIME_24_SIMPLE);

export const secondsToDateString = (seconds: bigint): string =>
  secondsToDateTime(seconds).toLocaleString(DateTime.DATE_MED);

export const secondsToDateTimeString = (seconds: bigint): string =>
  `${secondsToDateString(seconds)}, ${secondsToTimeString(seconds)}`;

export const sumBigNumberArray = (numbers: BigNumber[]): BigNumber => {
  if (numbers.length === 0) return new BigNumber(0);
  return BigNumber.sum(...numbers);
};

export const secondsToTimeRemainingString = (
  startTimeInSeconds: bigint,
  endTimeInSeconds: bigint
): string | undefined => {
  return;
  if (endTimeInSeconds < startTimeInSeconds) {
    return undefined;
  }

  const toMilliNumber = (n: bigint): number =>
    fns.secondsToMilliseconds(Number(n));
  const interval = {
    start: toMilliNumber(startTimeInSeconds),
    end: toMilliNumber(endTimeInSeconds),
  };
  const format: fns.DurationUnit[] = ["days", "hours", "minutes"];
  const timeLeft = fns.intervalToDuration(interval);
  const formatted = fns.formatDuration(timeLeft, {
    format,
    zero: true,
    delimiter: ": ",
  });

  if (formatted === "") {
    return "< 1 Min";
  }

  return formatted
    .replace("day", "Day")
    .replace("hour", "Hr")
    .replace("minute", "Min");
};

const findDisplayUnit = (asset: Asset): AssetDenomUnit | undefined => {
  const { display, denom_units } = asset;
  return denom_units.find((unit) => unit.denom === display);
};

// TODO update to mainnet asset
export const namadaAsset = internalDevnetAssets.assets[0];

export const isNamadaAsset = (asset: Asset): boolean =>
  asset.symbol === namadaAsset.symbol;

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
  if (isNamadaAsset(asset)) return displayAmount;
  const displayUnit = findDisplayUnit(asset);
  if (!displayUnit) {
    return displayAmount;
  }
  return displayAmount.shiftedBy(displayUnit.exponent);
};
