export type Config = {
  tries: number;
  ms: number;
};

export type Options = {
  predFn: () => Promise<boolean>;
  onSuccess: () => unknown;
  onFail: () => unknown;
};

export const wait = async (ms: number): Promise<unknown> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

/**
 * Execute attempts until predicate is satisfied
 */
export const executeUntil = async (
  config: Config,
  options: Options
): Promise<void> => {
  const { predFn, onSuccess, onFail } = options;
  let succ = false;
  let { tries } = config;

  while (!succ && tries > 0) {
    succ = await predFn();
    tries--;
    await wait(config.ms);
  }

  const fn = succ ? onSuccess : onFail;
  fn();
};
