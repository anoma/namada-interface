import {
  Action,
  configureStore,
  MiddlewareArray,
  ThunkAction,
} from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { accountsReducer } from "slices";
import { accountsStorageMiddleware } from "store/middleware";

const store = configureStore({
  reducer: {
    accounts: accountsReducer,
  },
  middleware: new MiddlewareArray().concat(accountsStorageMiddleware),
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
