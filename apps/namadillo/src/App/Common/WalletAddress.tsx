import { Tooltip } from "@namada/components";
import { shortenAddress } from "@namada/utils";
import { twMerge } from "tailwind-merge";

type WalletAddressProps = {
  address: string;
  className?: string;
  prefixLength?: number;
  suffixLength?: number;
};

export const WalletAddress = ({
  address,
  className,
  prefixLength = 8,
  suffixLength = 8,
}: WalletAddressProps): JSX.Element => {
  const shortenedAddress = shortenAddress(address, prefixLength, suffixLength);
  return (
    <span className="relative group/tooltip">
      {shortenedAddress}
      <Tooltip className={twMerge("z-50", className)}>{address}</Tooltip>
    </span>
  );
};
