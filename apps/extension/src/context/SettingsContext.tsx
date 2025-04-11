import { ExtensionKVStore } from "@namada/storage";
import { createContext, useContext, useEffect, useState } from "react";
import { KVPrefix } from "router";
import { LocalStorage } from "storage";
import browser from "webextension-polyfill";

// Extension storages
const localStorage = new LocalStorage(
  new ExtensionKVStore(KVPrefix.LocalStorage, browser.storage.local)
);

type SettingsStorage = {
  showDisposableAccounts: boolean;
};

type SettingsContextProps = {
  children: JSX.Element;
};

type SettingsContextType = {
  showDisposableAccounts: boolean;
  toggleShowDisposableAccounts: () => Promise<void>;
};

// This initializer
const createSettingsContext = (): SettingsContextType => ({
  showDisposableAccounts: false,
  toggleShowDisposableAccounts: () => Promise.resolve(),
});

export const SettingsContext = createContext<SettingsContextType>(
  createSettingsContext()
);

export const SettingsContextProvider = ({
  children,
}: SettingsContextProps): JSX.Element => {
  const [showDisposableAccounts, setShowDisposableAccounts] =
    useState<boolean>(false);

  useEffect(() => {
    void (async () => {
      const settings = await localStorage.getSettings();

      if (settings) {
        setShowDisposableAccounts(settings.showDisposableAccounts);
      }
    })();
  }, []);

  const toggleShowDisposableAccounts = async (): Promise<void> => {
    const newSettings: SettingsStorage = {
      showDisposableAccounts: !showDisposableAccounts,
    };
    await localStorage.setSettings(newSettings);
    setShowDisposableAccounts(!showDisposableAccounts);
  };

  return (
    <SettingsContext.Provider
      value={{
        showDisposableAccounts,
        toggleShowDisposableAccounts,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = (): SettingsContextType => {
  return useContext(SettingsContext);
};
