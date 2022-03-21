import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AppState } from "./store";

export const useAppDispatch: typeof useDispatch = () => useDispatch();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
