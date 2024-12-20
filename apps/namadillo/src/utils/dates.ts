import { DateTime } from "luxon";

export const epochToString = (epoch: bigint): string =>
  `Epoch ${epoch.toString()}`;

export const secondsToDateTime = (seconds: bigint): DateTime =>
  DateTime.fromSeconds(Number(seconds));

export const secondsToTimeString = (seconds: bigint): string =>
  secondsToDateTime(seconds).toLocaleString(DateTime.TIME_SIMPLE);

export const secondsToDateString = (seconds: bigint): string =>
  secondsToDateTime(seconds).toLocaleString(DateTime.DATE_MED);

export const secondsToDateTimeString = (seconds: bigint): string =>
  `${secondsToDateString(seconds)}, ${secondsToTimeString(seconds)}`;

export const secondsToFullDateTimeString = (seconds: bigint): string =>
  secondsToDateTime(seconds).toLocaleString(DateTime.DATETIME_FULL);

export const secondsToTimeRemainingString = (
  startTimeInSeconds: bigint,
  endTimeInSeconds: bigint
): string =>
  secondsToDateTime(endTimeInSeconds)
    .diff(secondsToDateTime(startTimeInSeconds), ["days", "hours", "minutes"])
    .toHuman();
