/* eslint-disable @typescript-eslint/explicit-function-return-type */
/**
 * Small wrapper for fetch to make it easier to pass props
 * Called wasmFetch to avoid naming conflict
 */
export async function wasmFetch(url: string, method: string, body: string) {
  const res = await fetch(url, {
    method,
    body,
  });
  return res;
}
