import { useEffect, useState } from "react";

type Difference = {
  days: number;
  hours: number;
  minutes: number;
};

type Props = {
  endDate: Date;
};

const format = (val: number): string => {
  const str = val.toString();
  return str.length === 1 ? `0${str}` : str;
};

const getDifference = (milliDiff: number): Difference => ({
  days: Math.floor(milliDiff / (1000 * 60 * 60 * 24)),
  hours: Math.floor((milliDiff / (1000 * 60 * 60)) % 24),
  minutes: Math.ceil((milliDiff / 1000 / 60) % 60),
});

export const Countdown: React.FC<Props> = ({ endDate }) => {
  const [now, setNow] = useState<number>(new Date().getTime());
  const { days, hours, minutes } = getDifference(endDate.getTime() - now);
  const expired = new Date().getTime() >= endDate.getTime();

  useEffect(() => {
    const interval = setInterval(function () {
      if (expired) {
        clearInterval(interval);
      } else {
        setNow(new Date().getTime());
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <strong>
      {expired
        ? "00D : 00M : 00M"
        : `${format(days)}D : ${format(hours)}H : ${format(minutes)}M`}
    </strong>
  );
};
