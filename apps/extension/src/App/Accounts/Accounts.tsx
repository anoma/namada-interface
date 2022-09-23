import { DerivedAccount } from "background/keyring";
import {
  AccountsContainer,
  AccountsList,
  AccountsListItem,
} from "./Accounts.components";

type Props = {
  accounts: DerivedAccount[];
};

const Accounts = ({ accounts }: Props): JSX.Element => {
  return (
    <AccountsContainer>
      <AccountsList>
        {accounts.map((account, i) => (
          <AccountsListItem key={`account-${i}`}>
            <code>
              m/44'/{account.bip44Path.account}'/{account.bip44Path.change}'/
              {account.bip44Path.index}'
            </code>
            &nbsp;
            <code>{account.address}</code>
          </AccountsListItem>
        ))}
      </AccountsList>
    </AccountsContainer>
  );
};

export default Accounts;
