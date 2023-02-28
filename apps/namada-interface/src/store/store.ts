import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import thunk from "redux-thunk";
import {
  accountsReducer,
  transfersReducer,
  settingsReducer,
  channelsReducer,
  coinsReducer,
  notificationsReducer,
  stakingAndGovernanceReducers,
} from "slices";

const reducers = combineReducers({
  accounts: accountsReducer || {},
  transfers: transfersReducer || {},
  channels: channelsReducer,
  settings: settingsReducer,
  coins: coinsReducer,
  notifications: notificationsReducer,
  stakingAndGovernance: stakingAndGovernanceReducers,
});

const { NODE_ENV } = process.env;

const store = configureStore({
  reducer: reducers,
  devTools: NODE_ENV !== "production",
  middleware: [thunk],
});
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

export default store;
