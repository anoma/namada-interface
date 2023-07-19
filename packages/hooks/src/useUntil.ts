import { useEffect } from "react";

import { executeUntil, Config } from "@namada/utils";

type Options = {
  predFn: () => Promise<boolean>;
  onSuccess: () => unknown;
  onFail: () => unknown;
};

/**
 * Hook that wait until predicate is met
 *
 * @param {Options} options - Predicate function, onSuccess and onFail callbacks
 * @param {Config} config - Number of tries and time between tries before hook fails
 * @param {React.DependencyList} [deps] - List of dependencies for hook to restart
 */
export const useUntil = (
  options: Options,
  config: Config,
  deps: React.DependencyList
): void => {
  useEffect(() => {
    const { predFn, onSuccess, onFail } = options;
    (async () => {
      const succ = await executeUntil(predFn, config);
      const fn = succ ? onSuccess : onFail;
      await fn();
    })();
  }, deps);
};
