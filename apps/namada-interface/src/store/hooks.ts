import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AppState, AppStore } from "./store";

export const useAppDispatch: typeof useDispatch = () =>
  useDispatch<AppStore["dispatch"]>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
