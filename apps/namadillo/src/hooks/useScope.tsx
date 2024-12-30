import { RefObject, useLayoutEffect } from "react";

type QueryFnOutput = ReturnType<typeof document.querySelectorAll>;
type CallbackFn = (query: string) => QueryFnOutput;
type CallbackProps = (callback: CallbackFn, container: HTMLElement) => void;

export const useScope = (
  callback: CallbackProps,
  scope: RefObject<HTMLElement>,
  dependencies = []
): void => {
  useLayoutEffect(() => {
    const queryFn = (query: string): QueryFnOutput => {
      if (!scope.current)
        throw "You must pass a valid scope for useAnimation hook";
      return scope.current.querySelectorAll(query);
    };

    if (!scope.current) return;
    callback(queryFn, scope.current);
  }, [...dependencies]);
};
