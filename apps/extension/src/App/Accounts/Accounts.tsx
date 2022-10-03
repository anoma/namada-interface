import { DerivedAccount } from "background/keyring";
import {
  AccountsContainer,
  AccountsList,
  AccountsListItem,
  ThemedScrollbarContainer,
} from "./Accounts.components";
import { AccountListing } from "App/Accounts";

type Props = {
  accounts: DerivedAccount[];
};

const Accounts = ({ accounts }: Props): JSX.Element => {
  const rootAccount = accounts[0];
  const { alias = "" } = rootAccount || {};

  return (
    <AccountsContainer>
      <ThemedScrollbarContainer>
        <AccountsList>
          {accounts.map((account) => (
            <AccountsListItem key={`account-${account.id}`}>
              <AccountListing account={account} alias={alias} />
            </AccountsListItem>
          ))}
        </AccountsList>
      </ThemedScrollbarContainer>
    </AccountsContainer>
  );
};

export default Accounts;
