import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import thunk from "redux-thunk";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import {
  accountsReducer,
  transfersReducer,
  settingsReducer,
  channelsReducer,
  coinsReducer,
  notificationsReducer,
  stakingAndGovernanceReducers,
} from "slices";
import { LocalStorageKeys } from "App/types";

const { REACT_APP_LOCAL, NODE_ENV } = process.env;
const POSTFIX =
  NODE_ENV === "development" ? (REACT_APP_LOCAL ? "-local" : "-dev") : "";

const reducers = combineReducers({
  accounts: accountsReducer || {},
  transfers: transfersReducer || {},
  channels: channelsReducer,
  settings: settingsReducer,
  coins: coinsReducer,
  notifications: notificationsReducer,
  stakingAndGovernance: stakingAndGovernanceReducers,
});

const persistConfig = {
  key: `${LocalStorageKeys.Persist}${POSTFIX}`,
  storage,
  // Only persist data in whitelist:
  whitelist: ["settings"],
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
