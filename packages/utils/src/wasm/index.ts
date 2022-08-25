/**
 * Fetch wasm and return as Uint8Array
 * @param name
 * @param path
 * @returns {Uint8Array}
 */
export const fetchWasmCode = async (
  name: string,
  path = "/wasm/"
): Promise<Uint8Array> => {
  const results = await fetch(`${path}${name}`);
  const wasmBuffer = await results.arrayBuffer();
  return new Uint8Array(wasmBuffer);
};
