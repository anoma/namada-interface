import { useNavigate } from "react-router-dom";

import { Icon, IconName } from "@anoma/components";
import { AccountType, Bip44Path, DerivedAccount } from "@anoma/types";
import { shortenAddress } from "@anoma/utils";

import { TopLevelRoute } from "App/types";
import {
  AccountListingContainer,
  Address,
  Buttons,
  Details,
  Alias,
  DerivationPath,
  Button,
  ParentAlias,
  DerivationPathContainer,
} from "./AccountListing.components";

type Props = {
  // The parent BIP44/ZIP32 "account"
  parent?: number;
  // The child account
  account: DerivedAccount;
  parentAlias: string;
};

const textToClipboard = (content: string): void => {
  navigator.clipboard.writeText(content);
};

const formatDerivationPath = (
  isChildAccount: boolean,
  { account, change, index = 0 }: Bip44Path,
  type: AccountType
): string =>
  isChildAccount
    ? `/${account}'/${
        type === AccountType.PrivateKey ? `${change}/` : ""
      }${index}`
    : "";

const AccountListing = ({ account, parentAlias }: Props): JSX.Element => {
  const { address, alias, path, type } = account;
  const navigate = useNavigate();
  const isChildAccount = type !== AccountType.Mnemonic;

  return (
    <AccountListingContainer>
      <Details>
        <DerivationPathContainer>
          {isChildAccount && <ParentAlias>{parentAlias}</ParentAlias>}
          <DerivationPath>
            {formatDerivationPath(isChildAccount, path, type)}
          </DerivationPath>
        </DerivationPathContainer>
        {alias && <Alias>{alias}</Alias>}
        <Address>{shortenAddress(address)}</Address>
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
          onClick={(e) => {
            e.preventDefault();
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
