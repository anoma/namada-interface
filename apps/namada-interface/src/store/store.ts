import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import thunk from "redux-thunk";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import {
  accountsReducer,
  settingsReducer,
  channelsReducer,
  coinsReducer,
  notificationsReducer,
  proposalsReducers,
  stakingAndGovernanceReducers,
} from "slices";
import { LocalStorageKeys } from "App/types";
import { createTransform } from "redux-persist";
import { SettingsState } from "slices/settings";
import { chains, defaultChainId } from "@namada/chains";

const { REACT_APP_LOCAL, NODE_ENV } = process.env;
const POSTFIX =
  NODE_ENV === "development" ? (REACT_APP_LOCAL ? "-local" : "-dev") : "";

const ChainIdTransform = createTransform(
  (inboundState: SettingsState) => {
    return inboundState;
  },
  (outboundState: SettingsState) => {
    const savedChainId = outboundState.chainId;
    const chainId = savedChainId in chains ? savedChainId : defaultChainId;

    return { ...outboundState, chainId };
  },
  { whitelist: ["settings"] }
);

const reducers = combineReducers({
  accounts: accountsReducer || {},
  channels: channelsReducer,
  settings: settingsReducer,
  coins: coinsReducer,
  notifications: notificationsReducer,
  stakingAndGovernance: stakingAndGovernanceReducers,
  proposals: proposalsReducers,
});

const persistConfig = {
  key: `${LocalStorageKeys.Persist}${POSTFIX}`,
  storage,
  // Only persist data in whitelist:
  whitelist: ["settings", "channels"],
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

export { store, persistor };
