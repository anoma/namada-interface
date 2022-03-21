import { Middleware } from "@reduxjs/toolkit";

export const accountsStorageMiddleware: Middleware =
  (store) => (next) => (action) => {
    const result = next(action);
    if (action.type?.startsWith("accounts/")) {
      const accountsState = store.getState().accounts;
      localStorage.setItem("accounts", JSON.stringify(accountsState));
    }
    return result;
  };
