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

//TODO: Move to shared components
export const Countdown: React.FC<Props> = ({ endDate }) => {
  const [now, setNow] = useState<number>(new Date().getTime());
  const { days, hours, minutes } = getDifference(endDate.getTime() - now);

  useEffect(() => {
    const interval = setInterval(function () {
      const now = new Date().getTime();
      if (now >= endDate.getTime()) {
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
    <div>
      {format(days)}D : {format(hours)}H : {format(minutes)}M
    </div>
  );
};
