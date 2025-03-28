import { createContext, useContext, useEffect, useState } from "react";

type SettingsStorage = {
  showDisposableAccounts: boolean;
};

type SettingsContextProps = {
  children: JSX.Element;
};

type SettingsContextType = {
  showDisposableAccounts: boolean;
  toggleShowDisposableAccounts: () => void;
};

// This initializer
const createSettingsContext = (): SettingsContextType => ({
  showDisposableAccounts: false,
  toggleShowDisposableAccounts: () => {},
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
    const storedSettings = localStorage.getItem("settings");

    if (storedSettings) {
      const settings: SettingsStorage = JSON.parse(storedSettings);
      setShowDisposableAccounts(settings.showDisposableAccounts);
    }
  }, []);

  const toggleShowDisposableAccounts = (): void => {
    const newSettings: SettingsStorage = {
      showDisposableAccounts: !showDisposableAccounts,
    };
    localStorage.setItem("settings", JSON.stringify(newSettings));
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
