import { WritableAtom, useAtom } from "jotai";
import { Loadable } from "jotai/vanilla/utils/loadable";
import { useEffect, useState } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AppState, AppStore } from "./store";

export const useAppDispatch: typeof useDispatch = () =>
  useDispatch<AppStore["dispatch"]>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

export const useLoadable = <Value, Args extends unknown[], Result>(
  anAtom: WritableAtom<Value, Args, Result>,
  ...args: Args
): Loadable<Value> => {
  const [value, callable] = useAtom(anAtom);
  const [loadState, setLoadState] = useState<Loadable<Value>>({
    state: "loading",
  });

  useEffect(() => {
    (async () => {
      setLoadState({ state: "loading" });
      try {
        await callable(...args);
        // value still has its default/old value
        setLoadState({ state: "hasData", data: value });
      } catch (error) {
        setLoadState({ state: "hasError", error });
      }
    })();
  }, [callable]);

  if (loadState.state === "hasData") {
    return {
      state: loadState.state,
      data: value, // updated value
    };
  }

  return loadState;
};

export const useReadAsyncAtom = <Value, Args extends unknown[], Result>(
  anAtom: WritableAtom<Value, Args, Result>,
  ...args: Args
): Value | undefined => {
  const loadable = useLoadable<Value, Args, Result>(anAtom, ...args);
  if (loadable.state === "hasData") return loadable.data;
  return undefined;
};
