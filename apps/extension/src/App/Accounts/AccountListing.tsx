import { useNavigate } from "react-router-dom";

import { Icon, IconName } from "@namada/components";
import { AccountType, Bip44Path, DerivedAccount } from "@namada/types";
import { shortenAddress } from "@namada/utils";

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

const isChild = (type: AccountType, path: Bip44Path): boolean => {
  // All PrivateKey accounts are child accounts
  if (type === AccountType.PrivateKey) {
    return true;
  }

  if (type === AccountType.Ledger) {
    // If this is a Ledger account, a child account is any account
    // with a path that isn't the default path (/0'/0/0). This is for display
    // purposes only. If the sum of the path components is greater than
    // zero, it is a child.
    const { account, change, index = 0 } = path;
    return account + change + index > 0;
  }

  return false;
};

const formatDerivationPath = (
  isChildAccount: boolean,
  { account, change, index = 0 }: Bip44Path,
  type: AccountType
): string =>
  isChildAccount
    ? `/${account}'/${
        type !== AccountType.Mnemonic ? `${change}/` : ""
      }${index}`
    : "";

const AccountListing = ({ account, parentAlias }: Props): JSX.Element => {
  const { address, alias, path, type } = account;
  const navigate = useNavigate();
  const isChildAccount = isChild(type, path);
  const isLedgerParent = type === AccountType.Ledger && !isChildAccount;

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
        {(type === AccountType.Mnemonic || isLedgerParent) && (
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
