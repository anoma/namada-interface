import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import { encryptTransform } from "redux-persist-transform-encrypt";
import thunk from "redux-thunk";
import { accountsReducer } from "slices";
import { Session } from "lib";

const { REACT_APP_LOCAL, NODE_ENV } = process.env;

// Append to our store name to support multiple environments
const POSTFIX =
  NODE_ENV === "development" ? (REACT_APP_LOCAL ? "-local" : "-dev") : "";

const reducers = combineReducers({
  accounts: accountsReducer,
});

const persistConfig = {
  key: `anoma-wallet${POSTFIX}`,
  storage,
  // Only persist data in whitelist:
  whitelist: ["accounts"],
  transforms: [
    encryptTransform({
      secretKey: new Session().secret,
      onError: function (error) {
        // Handle the error.
        console.error(error);
      },
    }),
  ],
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

export default store;
