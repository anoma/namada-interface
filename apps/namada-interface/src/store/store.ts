import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { LocalStorageKeys } from "App/types";
import { combineReducers } from "redux";
import { createTransform, persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import thunk from "redux-thunk";
import {
  accountsReducer,
  chainReducer,
  channelsReducer,
  notificationsReducer,
  proposalsReducers,
  settingsReducer,
  stakingAndGovernanceReducers,
} from "slices";
import { SettingsState } from "slices/settings";

import { atomWithStore } from "jotai-redux";

const { NAMADA_INTERFACE_LOCAL, NODE_ENV } = process.env;
const POSTFIX =
  NODE_ENV === "development"
    ? NAMADA_INTERFACE_LOCAL
      ? "-local"
      : "-dev"
    : "";

const ChainIdTransform = createTransform(
  (inboundState: SettingsState) => {
    return inboundState;
  },
  (outboundState: SettingsState) => {
    return outboundState;
  },
  { whitelist: ["settings"] }
);

const reducers = combineReducers({
  accounts: accountsReducer || {},
  chain: chainReducer,
  channels: channelsReducer,
  settings: settingsReducer,
  notifications: notificationsReducer,
  stakingAndGovernance: stakingAndGovernanceReducers,
  proposals: proposalsReducers,
});

const persistConfig = {
  key: `${LocalStorageKeys.Persist}${POSTFIX}`,
  storage,
  // Only persist data in whitelist:
  whitelist: ["settings", "chain", "channels"],
  transforms: [ChainIdTransform],
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  devTools: NODE_ENV !== "production",
  middleware: [thunk],
});
const persistor = persistStore(store);
export type RootState = ReturnType<typeof reducers>;

export type AppStore = typeof store;
export type AppState = ReturnType<AppStore["getState"]>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;
export type AppDispatch = ReturnType<AppStore["dispatch"]>;

const reduxStoreAtom = atomWithStore(store);

export { persistor, reduxStoreAtom, store };
