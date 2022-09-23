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
      <DerivationPath>
        m/44'/{account.bip44Path.account}'/{account.bip44Path.change}'/
        {account.bip44Path.index}'
      </DerivationPath>
      &nbsp;
      <Address>{account.address}</Address>
    </AccountListingContainer>
  );
};

export default AccountListing;
