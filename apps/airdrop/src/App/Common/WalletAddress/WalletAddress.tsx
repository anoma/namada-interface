import {
  FirstPart,
  LastPart,
  WalletAddressContainer,
} from "./WalletAddress.components";

type WalletAddressProps = {
  value: string;
};

export const WalletAddress = ({ value }: WalletAddressProps): JSX.Element => {
  const len = value.length;
  const firstPart = value.slice(0, len - 4);
  const lastPart = value.slice(len - 4, len);
  return (
    <WalletAddressContainer title={value}>
      <FirstPart>{firstPart}</FirstPart>
      <LastPart>{lastPart}</LastPart>
    </WalletAddressContainer>
  );
};
