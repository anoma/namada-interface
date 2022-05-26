import {
  Action,
  configureStore,
  EnhancedStore,
  ThunkAction,
} from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import { encryptTransform } from "redux-persist-transform-encrypt";
import thunk from "redux-thunk";
import { accountsReducer, transfersReducer, settingsReducer } from "slices";
import { LocalStorageKeys } from "App/types";
import { hashPassword } from "utils/helpers";

const reducers = combineReducers({
  accounts: accountsReducer,
  transfers: transfersReducer,
  settings: settingsReducer,
});

type StoreFactory = (secretKey: string) => EnhancedStore;

const makeStore: StoreFactory = (secret) => {
  const { REACT_APP_LOCAL, NODE_ENV } = process.env;
  const hash = hashPassword(secret);
  // Append to our store name to support multiple environments
  const POSTFIX =
    NODE_ENV === "development" ? (REACT_APP_LOCAL ? "-local" : "-dev") : "";

  const persistConfig = {
    key: `${LocalStorageKeys.Persist}${POSTFIX}`,
    storage,
    // Only persist data in whitelist:
    whitelist: ["accounts", "transfers", "settings"],
    transforms: [
      encryptTransform({
        secretKey: hash,
        onError: function (error) {
          // Handle the error.
          console.error(error);
        },
      }),
    ],
  };

  const persistedReducer = persistReducer(persistConfig, reducers);

  return configureStore({
    reducer: persistedReducer,
    devTools: NODE_ENV !== "production",
    middleware: [thunk],
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore["getState"]>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;
export type AppDispatch = ReturnType<AppStore["dispatch"]>;

export default makeStore;
