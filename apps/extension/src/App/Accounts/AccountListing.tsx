import { useNavigate } from "react-router-dom";
import { Icon, IconName } from "@anoma/components";
import { AccountType, DerivedAccount } from "@anoma/types";
import {
  AccountListingContainer,
  Address,
  Buttons,
  Details,
  Alias,
  DerivationPath,
  Button,
} from "./AccountListing.components";

import { TopLevelRoute } from "App/types";

type Props = {
  // The parent Bip44 "account"
  parent?: number;
  // The child account
  account: DerivedAccount;
  parentAlias: string;
};

const textToClipboard = (content: string): void => {
  navigator.clipboard.writeText(content);
};

const AccountListing = ({ account, parentAlias }: Props): JSX.Element => {
  const { address, alias, path, type } = account;
  const navigate = useNavigate();

  return (
    <AccountListingContainer>
      <Details>
        <DerivationPath>
          {type !== AccountType.Mnemonic &&
            `${parentAlias} /${path.account}'/${path.change}${
              typeof path.index === "number" ? "/" + path.index : ""
            }`}
        </DerivationPath>
        {alias && <Alias>{alias}</Alias>}
        <Address>{address}</Address>
      </Details>
      <Buttons>
        {type === AccountType.Mnemonic && (
          <Button
            onClick={() => {
              navigate(TopLevelRoute.AddAccount);
            }}
          >
            <Icon iconName={IconName.Plus} />
          </Button>
        )}
        <Button
          onClick={() => {
            textToClipboard(address);
          }}
          href="#"
        >
          <Icon iconName={IconName.Copy} />
        </Button>
      </Buttons>
    </AccountListingContainer>
  );
};

export default AccountListing;
