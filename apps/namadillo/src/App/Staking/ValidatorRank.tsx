import { ValidatorStatus } from "@namada/indexer-client";
import clsx from "clsx";

type ValidatorRankProps = {
  rank?: number;
  status: ValidatorStatus;
};

export const ValidatorRank = ({
  rank,
  status,
}: ValidatorRankProps): JSX.Element => {
  const className = "text-xs";

  if (status === "consensus") {
    return <span className={clsx(className)}>#{rank}</span>; // TODO: implement rank
  }

  if (status === "belowThreshold") {
    return <span className={clsx(className)}>#{rank}</span>;
  }

  if (status === "unknown" || status === "belowCapacity") {
    return <span className={clsx(className)}>&mdash;</span>;
  }

  if (status === "jailed") {
    return (
      <span className={clsx(className, "text-fail relative")}>
        #{rank}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10.606 12.608"
          className="absolute top-0.5 left-0.5 w-[90%]"
        >
          <title>Jailed</title>
          <path
            fill="red"
            d="M1.3 0H0v12.608h1.3zm3.102 0h-1.3v12.608h1.3zm3.102 0h-1.3v12.608h1.3zm3.102 0h-1.3v12.608h1.3z"
          />
        </svg>
      </span>
    );
  }

  if (status === "inactive") {
    return <span className={clsx(className, "opacity-50")}>#{rank}</span>;
  }

  return <></>;
};
