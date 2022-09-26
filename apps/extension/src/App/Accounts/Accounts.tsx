import { Icon, IconName } from "@anoma/components";
import { DerivedAccount } from "background/keyring";
import {
  AccountsContainer,
  AccountsList,
  AccountsListItem,
  ButtonContainer,
  Button,
  ButtonText,
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
      <ButtonContainer>
        <Button>
          <ButtonText>Derive new account</ButtonText>
          <Icon iconName={IconName.Plus} />
        </Button>
      </ButtonContainer>
    </AccountsContainer>
  );
};

export default Accounts;
