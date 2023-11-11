import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import browser from "webextension-polyfill";

import {
  ActionButton,
  GapPatterns,
  Heading,
  KeyListItem,
  LinkButton,
  Stack,
  Text,
} from "@namada/components";
import { DerivedAccount } from "@namada/types";
import routes from "App/routes";
import { ParentAccount } from "background/keyring";
import { AccountContext } from "context";
import { SettingsHeader } from "./ParentAccounts.components";

type ParentAccountsProps = {
  onLockApp: () => void;
};

/**
 * Represents the extension's settings page.
 */
export const ParentAccounts = ({
  onLockApp,
}: ParentAccountsProps): JSX.Element => {
  const navigate = useNavigate();
  const { activeAccountId, parentAccounts, changeActiveAccountId } =
    useContext(AccountContext);

  const goToSetupPage = (): void => {
    browser.tabs.create({
      url: browser.runtime.getURL("setup.html"),
    });
  };

  const goToViewAccount = (account: DerivedAccount): void => {
    navigate(routes.viewAccount(account.id));
  };

  const goToDeletePage = (account: DerivedAccount): void => {
    navigate(routes.deleteAccount(account.id), { state: { account } });
  };

  const goToConnectedSites = (): void => {
    navigate(routes.connectedSites());
  };

  return (
    <Stack gap={GapPatterns.TitleContent}>
      <Heading>Namada Keys</Heading>
      <Stack gap={4}>
        <SettingsHeader>
          <Text>Set default keys</Text>
          <ActionButton size="sm" onClick={goToSetupPage}>
            Add keys
          </ActionButton>
        </SettingsHeader>
        <Stack as="ul" gap={4}>
          {[...parentAccounts].reverse().map((account) => (
            <KeyListItem
              key={`key-listitem-${account.id}`}
              as="li"
              alias={account.alias}
              isMainKey={activeAccountId === account.id}
              onRename={() => {}}
              onDelete={() => goToDeletePage(account)}
              onViewAccount={() => goToViewAccount(account)}
              onSelectAccount={() => {
                changeActiveAccountId(
                  account.id,
                  account.type as ParentAccount
                );
              }}
            />
          ))}
        </Stack>
        <ActionButton
          onClick={goToConnectedSites}
          variant="secondary"
          size="sm"
        >
          View Connected Sites
        </ActionButton>
        <ActionButton
          onClick={() => navigate(routes.changePassword())}
          size="sm"
        >
          Change password
        </ActionButton>
        <LinkButton onClick={onLockApp} size="sm">
          Lock Wallet
        </LinkButton>
      </Stack>
    </Stack>
  );
};
