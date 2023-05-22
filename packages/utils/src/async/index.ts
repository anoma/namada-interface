/**
 * Race a promise against a timeout
 */
export const promiseWithTimeout = <T = unknown>(
  promise: Promise<T>,
  timeout = 4000,
  error = "Request timed out"
): {
  promise: Promise<T>;
  timeoutId: number;
} => {
  let timeoutId: ReturnType<typeof setTimeout> | number = -1;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(error));
    }, timeout);
  });
  return {
    promise: Promise.race([promise, timeoutPromise]),
    timeoutId,
  };
};

/**
 * Debounce a function
 */
export const debounce = <ArgumentsType extends unknown[], ReturnType>(
  fn: (...args: ArgumentsType) => PromiseLike<ReturnType> | ReturnType
): ((...args: ArgumentsType) => Promise<ReturnType>) => {
  let currentPromise: PromiseLike<ReturnType> | ReturnType | undefined;

  return async (...arguments_) => {
    if (currentPromise) {
      return currentPromise;
    }

    try {
      currentPromise = fn.apply(this, arguments_);
      return await currentPromise;
    } finally {
      currentPromise = undefined;
    }
  };
};

export * from "./executeUntil";
