import { DerivedAccount } from "background/keyring";
import {
  AccountsContainer,
  AccountsList,
  AccountsListItem,
} from "./Accounts.components";
import { AccountListing } from "App/Accounts";

type Props = {
  accounts: DerivedAccount[];
};

const Accounts = ({ accounts }: Props): JSX.Element => {
  return (
    <AccountsContainer>
      <AccountsList>
        {accounts.map((account, i) => (
          <AccountsListItem key={`account-${i}`}>
            <AccountListing account={account} />
          </AccountsListItem>
        ))}
      </AccountsList>
    </AccountsContainer>
  );
};

export default Accounts;
