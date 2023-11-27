import { WalletAddressContainer } from "./WalletAddress.components";

type WalletAddressProps = {
  children: React.ReactNode;
};

export const WalletAddress = ({
  children,
}: WalletAddressProps): JSX.Element => {
  return <WalletAddressContainer>{children}</WalletAddressContainer>;
};
