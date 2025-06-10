import { Tooltip } from "@namada/components";
import { shortenAddress } from "@namada/utils";
import { isMaspAddress } from "App/Transfer/common";
import { useMemo } from "react";
import { GoLock } from "react-icons/go";
import { twMerge } from "tailwind-merge";

type WalletAddressProps = {
  address: string;
  className?: string;
  prefixLength?: number;
  suffixLength?: number;
  displayTooltip?: boolean;
  displayFullAddress?: boolean;
};

export const WalletAddress = ({
  address,
  className,
  prefixLength = 8,
  suffixLength = 8,
  displayFullAddress = false,
  displayTooltip = true,
}: WalletAddressProps): JSX.Element => {
  const parsedAddress = useMemo((): React.ReactNode => {
    if (isMaspAddress(address)) {
      return (
        <span className="flex gap-1 items-center">
          <GoLock />
          MASP
        </span>
      );
    }

    if (displayFullAddress) return address;
    return shortenAddress(address, prefixLength, suffixLength);
  }, [address, prefixLength, suffixLength, displayFullAddress]);

  return (
    <span className="relative group/tooltip">
      {parsedAddress}
      {displayTooltip && (
        <Tooltip className={twMerge("z-50", className)}>{address}</Tooltip>
      )}
    </span>
  );
};
