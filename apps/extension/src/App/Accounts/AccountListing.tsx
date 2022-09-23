import {
  AccountListingContainer,
  Address,
  Description,
  DerivationPath,
} from "./AccountListing.components";

import { DerivedAccount } from "background/keyring";

type Props = {
  account: DerivedAccount;
};

const AccountListing = ({ account }: Props): JSX.Element => {
  const { address, bip44Path, description, establishedAddress } = account;

  return (
    <AccountListingContainer>
      {description && <Description>{description}</Description>}
      <DerivationPath>
        /{bip44Path.account}'/{bip44Path.change}'/
        {bip44Path.index}'
      </DerivationPath>
      <Address>{address}</Address>
      {establishedAddress && <Address>{establishedAddress}</Address>}
    </AccountListingContainer>
  );
};

export default AccountListing;
