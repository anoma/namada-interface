import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import browser from "webextension-polyfill";

import {
  ActionButton,
  GapPatterns,
  Heading,
  KeyListItem,
  Stack,
  Text,
} from "@namada/components";
import { DerivedAccount } from "@namada/types";
import routes from "App/routes";
import { ParentAccount } from "background/keyring";
import { AccountContext } from "context";
import { ButtonContainer, SettingsHeader } from "./ParentAccounts.components";

/**
 * Represents the extension's settings page.
 */
export const ParentAccounts = (): JSX.Element => {
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

  const goToViewRecoveryPhrase = (account: DerivedAccount): void => {
    navigate(routes.viewAccountMnemonic(account.id));
  };

  const goToRenameAccount = (account: DerivedAccount): void => {
    navigate(routes.renameAccount(account.id), { state: { account } });
  };

  return (
    <Stack gap={GapPatterns.TitleContent}>
      <Heading size="2xl" uppercase>
        Keys Management
      </Heading>
      <Stack gap={4}>
        <SettingsHeader>
          <Text>Set default keys</Text>
          <ButtonContainer>
            <ActionButton size="xs" onClick={goToSetupPage}>
              Add keys
            </ActionButton>
          </ButtonContainer>
        </SettingsHeader>
        <Stack as="ul" gap={3}>
          {[...parentAccounts].reverse().map((account, idx) => (
            <KeyListItem
              key={`key-listitem-${account.id}`}
              as="li"
              alias={account.alias}
              type={account.type}
              dropdownPosition={
                idx > 2 && idx > parentAccounts.length - 4 ? "bottom" : "top"
              }
              isMainKey={activeAccountId === account.id}
              onRename={() => goToRenameAccount(account)}
              onDelete={() => goToDeletePage(account)}
              onViewAccount={() => goToViewAccount(account)}
              onViewRecoveryPhrase={() => goToViewRecoveryPhrase(account)}
              onSelectAccount={() => {
                changeActiveAccountId(
                  account.id,
                  account.type as ParentAccount
                );
              }}
            />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};
