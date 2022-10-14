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
  const parentAccount = accounts[0];
  const alias = parentAccount?.alias;

  return (
    <AccountsContainer>
      <ThemedScrollbarContainer>
        <AccountsList>
          {accounts.map((account) => (
            <AccountsListItem key={`account-${account.id}`}>
              <AccountListing account={account} parentAlias={alias} />
            </AccountsListItem>
          ))}
        </AccountsList>
      </ThemedScrollbarContainer>
    </AccountsContainer>
  );
};

export default Accounts;
