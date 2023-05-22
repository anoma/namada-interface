import { useEffect } from "react";

import { executeUntil, Config, Options } from "@anoma/utils";

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
  deps?: React.DependencyList
): void => {
  useEffect(() => {
    executeUntil(config, options);
  }, deps);
};
