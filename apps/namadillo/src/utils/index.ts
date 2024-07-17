import { ProposalStatus, ProposalTypeString } from "@namada/types";
import * as fns from "date-fns";
import { DateTime } from "luxon";
import { EventData, TransactionEvent } from "types/events";

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

export const addTransactionEvent = <T>(
  handle: TransactionEvent,
  callback: (e: EventData<T>) => void
): void => {
  window.addEventListener(handle, callback as EventListener, false);
};

const secondsToDateTime = (seconds: bigint): DateTime =>
  DateTime.fromSeconds(Number(seconds));

export const secondsToTimeString = (seconds: bigint): string =>
  secondsToDateTime(seconds).toLocaleString(DateTime.TIME_24_SIMPLE);

export const secondsToDateString = (seconds: bigint): string =>
  secondsToDateTime(seconds).toLocaleString(DateTime.DATE_MED);

export const secondsToDateTimeString = (seconds: bigint): string =>
  `${secondsToDateString(seconds)}, ${secondsToTimeString(seconds)}`;

export const secondsToTimeRemainingString = (
  startTimeInSeconds: bigint,
  endTimeInSeconds: bigint
): string => {
  if (endTimeInSeconds < startTimeInSeconds) {
    throw new Error(
      `endTimeInSeconds ${endTimeInSeconds} is before startTimeInSeconds ${startTimeInSeconds}`
    );
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
