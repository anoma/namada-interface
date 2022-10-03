import { useNavigate } from "react-router-dom";
import { Icon, IconName } from "@anoma/components";
import {
  AccountListingContainer,
  Address,
  Buttons,
  Details,
  Alias,
  DerivationPath,
  Button,
} from "./AccountListing.components";

import { DerivedAccount, KeyStoreType } from "background/keyring";
import { TopLevelRoute } from "App/types";

type Props = {
  parent?: number;
  account: DerivedAccount;
  alias: string;
};

const textToClipboard = (content: string): void => {
  navigator.clipboard.writeText(content);
};

const AccountListing = ({ account, alias: rootAlias }: Props): JSX.Element => {
  const { address, alias, path, establishedAddress, type } = account;
  const navigate = useNavigate();

  return (
    <AccountListingContainer>
      <Details>
        <DerivationPath>
          {type !== KeyStoreType.Mnemonic &&
            `${rootAlias} /${path.account}'/${path.change}${
              typeof path.index === "number" ? "/" + path.index : ""
            }`}
        </DerivationPath>
        {alias && <Alias>{alias}</Alias>}
        <Address>{address}</Address>
        {establishedAddress && <Address>{establishedAddress}</Address>}
      </Details>
      <Buttons>
        {type === KeyStoreType.Mnemonic && (
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
