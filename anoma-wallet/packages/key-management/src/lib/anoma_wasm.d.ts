/* tslint:disable */
/* eslint-disable */
/**
* @param {number} size
* @returns {string}
*/
export function generate_mnemonic(size: number): string;
/**
*/
export enum PhraseSize {
  N12,
  N24,
}
/**
*/
export class Keypair {
  free(): void;
/**
* @param {string} mnemonic
* @param {number} iterations
* @returns {Keypair}
*/
  static from_mnemonic(mnemonic: string, iterations: number): Keypair;
/**
* @returns {any}
*/
  from_pointer_to_js_value(): any;
/**
* @param {any} js_data
* @returns {Keypair}
*/
  static from_js_value_to_pointer(js_data: any): Keypair;
/**
* @param {string} password
* @returns {Uint8Array}
*/
  encrypt_with_password(password: string): Uint8Array;
/**
* @param {Uint8Array} encrypted_key_pair_data
* @param {string} password
* @returns {Keypair | undefined}
*/
  static decrypt_with_password(encrypted_key_pair_data: Uint8Array, password: string): Keypair | undefined;
}
/**
*/
export class PublicKey {
  free(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_publickey_free: (a: number) => void;
  readonly __wbg_keypair_free: (a: number) => void;
  readonly generate_mnemonic: (a: number, b: number) => void;
  readonly keypair_from_mnemonic: (a: number, b: number, c: number) => number;
  readonly keypair_from_pointer_to_js_value: (a: number) => number;
  readonly keypair_from_js_value_to_pointer: (a: number, b: number) => void;
  readonly keypair_encrypt_with_password: (a: number, b: number, c: number, d: number) => void;
  readonly keypair_decrypt_with_password: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
