import * as fns from "date-fns";
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
