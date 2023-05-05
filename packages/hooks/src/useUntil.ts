import { useEffect } from "react";

type Options = {
  predFn: () => Promise<boolean>;
  onSuccess: () => unknown;
  onFail: () => unknown;
};

type Config = {
  tries: number;
  ms: number;
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
  deps?: React.DependencyList
): void => {
  const { predFn, onSuccess, onFail } = options;
  let { tries } = config;

  const wait = async (ms: number): Promise<unknown> => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  useEffect(() => {
    const execute = async (): Promise<void> => {
      let succ = false;
      while (!succ && tries > 0) {
        succ = await predFn();
        tries--;
        await wait(config.ms);
      }

      const fn = succ ? onSuccess : onFail;
      fn();
    };

    execute();
  }, deps);
};
