/* tslint:disable */
/* eslint-disable */
/**
*/
export function run(): void;
/**
*/
export enum PhraseSize {
  N12,
  N24,
}
export class Account {
  free(): void;
/**
* Initialize an account on the Ledger
* @param {string} secret
* @param {string} token
* @param {number} epoch
* @param {number} fee_amount
* @param {number} gas_limit
* @param {Uint8Array} tx_code
* @param {Uint8Array} vp_code
* @returns {any}
*/
  static init(secret: string, token: string, epoch: number, fee_amount: number, gas_limit: number, tx_code: Uint8Array, vp_code: Uint8Array): any;
}
/**
*/
export class DerivedAccount {
  free(): void;
}
/**
*/
export class ExtendedKeys {
  free(): void;
}
/**
*/
export class Keypair {
  free(): void;
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
* @returns {Uint8Array}
*/
  secret(): Uint8Array;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
}
/**
*/
export class Mnemonic {
  free(): void;
/**
* @param {number} size
* @returns {Mnemonic}
*/
  static new(size: number): Mnemonic;
/**
* @returns {string}
*/
  phrase(): string;
/**
* @param {string} phrase
* @returns {Mnemonic}
*/
  static from_phrase(phrase: string): Mnemonic;
/**
* @param {string} password
* @returns {Uint8Array}
*/
  to_encrypted(password: string): Uint8Array;
/**
* @param {Uint8Array} encrypted
* @param {string} password
* @returns {Mnemonic}
*/
  static from_encrypted(encrypted: Uint8Array, password: string): Mnemonic;
}
export class Transfer {
  free(): void;
/**
* @param {string} secret
* @param {string} encoded_source
* @param {string} encoded_target
* @param {string} token
* @param {number} amount
* @param {number} epoch
* @param {number} fee_amount
* @param {number} gas_limit
* @param {Uint8Array} tx_code
* @returns {any}
*/
  static new(secret: string, encoded_source: string, encoded_target: string, token: string, amount: number, epoch: number, fee_amount: number, gas_limit: number, tx_code: Uint8Array): any;
}
/**
*/
export class Tx {
  free(): void;
}
/**
*/
export class Wallet {
  free(): void;
/**
* @param {string} phrase
* @param {string} password
* @returns {Wallet}
*/
  static new(phrase: string, password: string): Wallet;
/**
* Derive account from a seed and a path
* @param {string} path
* @returns {DerivedAccount}
*/
  derive(path: string): DerivedAccount;
/**
* Get extended keys from path
* @param {string} path
* @returns {ExtendedKeys}
*/
  get_extended_keys(path: string): ExtendedKeys;
/**
* Get serialized Wallet
* @returns {any}
*/
  serialize(): any;
/**
* Get serialized extended keys
* @param {string} path
* @returns {any}
*/
  extended_keys(path: string): any;
/**
* Get serialized derived account
* @param {string} path
* @returns {any}
*/
  account(path: string): any;
}
/**
*/
export class WrapperTx {
  free(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_wallet_free: (a: number) => void;
  readonly __wbg_derivedaccount_free: (a: number) => void;
  readonly __wbg_extendedkeys_free: (a: number) => void;
  readonly wallet_new: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wallet_derive: (a: number, b: number, c: number, d: number) => void;
  readonly wallet_get_extended_keys: (a: number, b: number, c: number, d: number) => void;
  readonly wallet_serialize: (a: number, b: number) => void;
  readonly wallet_extended_keys: (a: number, b: number, c: number, d: number) => void;
  readonly wallet_account: (a: number, b: number, c: number, d: number) => void;
  readonly transfer_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number) => void;
  readonly account_init: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number) => void;
  readonly run: () => void;
  readonly __wbg_wrappertx_free: (a: number) => void;
  readonly __wbg_mnemonic_free: (a: number) => void;
  readonly mnemonic_new: (a: number) => number;
  readonly mnemonic_phrase: (a: number, b: number) => void;
  readonly mnemonic_from_phrase: (a: number, b: number) => number;
  readonly mnemonic_to_encrypted: (a: number, b: number, c: number, d: number) => void;
  readonly mnemonic_from_encrypted: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly __wbg_keypair_free: (a: number) => void;
  readonly keypair_from_pointer_to_js_value: (a: number) => number;
  readonly keypair_from_js_value_to_pointer: (a: number, b: number) => void;
  readonly keypair_secret: (a: number, b: number) => void;
  readonly keypair_to_bytes: (a: number, b: number) => void;
  readonly __wbg_tx_free: (a: number) => void;
  readonly rustsecp256k1_v0_4_1_context_create: (a: number) => number;
  readonly rustsecp256k1_v0_4_1_context_destroy: (a: number) => void;
  readonly rustsecp256k1_v0_4_1_default_illegal_callback_fn: (a: number, b: number) => void;
  readonly rustsecp256k1_v0_4_1_default_error_callback_fn: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __wbindgen_start: () => void;
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
