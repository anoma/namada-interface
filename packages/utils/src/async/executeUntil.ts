export type Config = {
  tries: number;
  ms: number;
};

export const wait = async (ms: number): Promise<unknown> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

/**
 * Execute attempts until predicate is satisfied
 *
 * @param {Function} predFn
 * @param {Config} config - number of tries and ms before failing
 */
export const executeUntil = async (
  predFn: () => Promise<boolean>,
  config: Config
): Promise<boolean> => {
  let succ = false;
  let { tries } = config;

  while (!succ && tries > 0) {
    succ = await predFn();
    tries--;
    await wait(config.ms);
  }

  return succ;
};
