import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import { encryptTransform } from "redux-persist-transform-encrypt";
import thunk from "redux-thunk";
import { useDispatch } from "react-redux";
import { accountsReducer } from "slices";

const reducers = combineReducers({
  accounts: accountsReducer,
});

const TEST_SECRET = "asdfasdf";

const persistConfig = {
  key: "anoma-wallet",
  storage,
  // Only persist data in whitelist:
  whitelist: ["accounts"],
  transforms: [
    encryptTransform({
      secretKey: TEST_SECRET,
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
export const useAppDispatch: typeof useDispatch = () => useDispatch();

export default store;
