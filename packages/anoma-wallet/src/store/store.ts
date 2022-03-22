import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import thunk from "redux-thunk";
import { useDispatch } from "react-redux";
import { accountsReducer } from "slices";

const reducers = combineReducers({
  accounts: accountsReducer,
});

const persistConfig = {
  key: "anoma-wallet",
  storage,
  // Only persist data in whitelist:
  whitelist: ["accounts"],
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: [thunk],
});

export type AppStore = typeof store;
export type AppState = ReturnType<AppStore["getState"]>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;
export type AppDispatch = ReturnType<AppStore["dispatch"]>;
export const useAppDispatch: typeof useDispatch = () => useDispatch();

export default store;
