import { Tooltip } from "@namada/components";
import { shortenAddress } from "@namada/utils";

type WalletAddressProps = {
  address: string;
  prefixLength?: number;
  suffixLength?: number;
};

export const WalletAddress = ({
  address,
  prefixLength = 8,
  suffixLength = 8,
}: WalletAddressProps): JSX.Element => {
  const shortenedAddress = shortenAddress(address, prefixLength, suffixLength);
  return (
    <span className="relative group/tooltip">
      {shortenedAddress}
      <Tooltip>{address}</Tooltip>
    </span>
  );
};
