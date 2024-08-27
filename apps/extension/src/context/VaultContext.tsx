import { useEventListener } from "@namada/hooks";
import { Events } from "@namada/types";
import { Result } from "@namada/utils";
import routes from "App/routes";
import {
  CheckIsLockedMsg,
  CheckPasswordInitializedMsg,
  CheckPasswordMsg,
  LockVaultMsg,
  LogoutMsg,
  ResetPasswordError,
  ResetPasswordMsg,
  UnlockVaultMsg,
} from "background/vault";
import { useRequester } from "hooks/useRequester";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ports } from "router";

type LockStatus = "locked" | "unlocked" | "pending";

// Add types here
type VaultContextType = {
  lock: () => Promise<void>;
  unlock: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkPassword: (password: string) => Promise<boolean>;
  lockStatus: LockStatus;
  changePassword: (
    oldPassword: string,
    newPassword: string
  ) => Promise<Result<null, ResetPasswordError>>;
  passwordInitialized: boolean | undefined;
};

// Create this initialize function using VaultContext Types
const createVaultContext = (): VaultContextType => {
  return {
    lock: async () => {},
    unlock: async (_password: string) => false,
    logout: async () => {},
    checkPassword: async (_password: string) => false,
    lockStatus: "locked",
    changePassword: async (_oldPassword: string, _newPassword: string) =>
      Result.ok(null),
    passwordInitialized: undefined,
  };
};

export const VaultContext =
  createContext<VaultContextType>(createVaultContext());

type VaultContextWrapperProps = {
  children: React.ReactNode;
};

export const VaultContextWrapper = ({
  children,
}: VaultContextWrapperProps): JSX.Element => {
  const requester = useRequester();
  const navigate = useNavigate();
  const [lockStatus, setLockStatus] = useState<LockStatus>("pending");
  const [passwordInitialized, setPasswordInitialized] = useState<
    undefined | boolean
  >();

  const unlock = async (password: string): Promise<boolean> => {
    const unlocked = await requester.sendMessage(
      Ports.Background,
      new UnlockVaultMsg(password)
    );

    if (unlocked) {
      setLockStatus("unlocked");
    }
    return unlocked;
  };

  const lock = async (): Promise<void> => {
    await requester.sendMessage(Ports.Background, new LockVaultMsg());
    setLockStatus("locked");
  };

  const logout = async (): Promise<void> => {
    await requester.sendMessage(Ports.Background, new LogoutMsg());
    setPasswordInitialized(false);
    setLockStatus("locked");
    navigate(routes.setup());
  };

  const checkPassword = async (password: string): Promise<boolean> => {
    return await requester.sendMessage(
      Ports.Background,
      new CheckPasswordMsg(password)
    );
  };

  const hasPasswordInitialized = async (): Promise<void> => {
    setPasswordInitialized(
      await requester.sendMessage(
        Ports.Background,
        new CheckPasswordInitializedMsg()
      )
    );
  };

  const changePassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<Result<null, ResetPasswordError>> => {
    const result = await requester.sendMessage(
      Ports.Background,
      new ResetPasswordMsg(oldPassword, newPassword)
    );
    return result;
  };

  const queryIsLocked = async (): Promise<void> => {
    const isLocked = await requester.sendMessage(
      Ports.Background,
      new CheckIsLockedMsg()
    );
    setLockStatus(isLocked ? "locked" : "unlocked");
  };

  useEventListener(Events.ExtensionLocked, () => {
    setLockStatus("locked");
  });

  useEffect(() => {
    void hasPasswordInitialized();
    void queryIsLocked();
  }, []);

  return (
    <VaultContext.Provider
      value={{
        lock,
        unlock,
        lockStatus,
        checkPassword,
        passwordInitialized,
        changePassword,
        logout,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVaultContext = (): VaultContextType => {
  return useContext(VaultContext);
};
