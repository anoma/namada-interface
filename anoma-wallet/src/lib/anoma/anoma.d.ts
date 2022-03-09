/* tslint:disable */
/* eslint-disable */
/**
*/
export function run(): void;
export class Account {
  free(): void;
/**
* Initialize an account on the Ledger
* @param {any} serialized_keypair
* @param {string} token
* @param {number} epoch
* @param {number} fee_amount
* @param {number} gas_limit
* @param {Uint8Array} tx_code
* @param {Uint8Array} vp_code
* @returns {any}
*/
  static init(serialized_keypair: any, token: string, epoch: number, fee_amount: number, gas_limit: number, tx_code: Uint8Array, vp_code: Uint8Array): any;
}
/**
*/
export class Address {
  free(): void;
/**
* @param {Keypair} keypair
* @returns {Address}
*/
  static from_keypair(keypair: Keypair): Address;
/**
* @param {string} encoded
* @returns {Address}
*/
  static decode(encoded: string): Address;
/**
* @returns {string}
*/
  readonly encoded: string;
}
/**
*/
export class Bip32Keys {
  free(): void;
}
/**
*/
export class Keypair {
  free(): void;
/**
* @returns {any}
*/
  serialize(): any;
/**
* @param {any} js_data
* @returns {Keypair}
*/
  static deserialize(js_data: any): Keypair;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
}
export class Transfer {
  free(): void;
/**
* @param {any} serialized_keypair
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
  static new(serialized_keypair: any, encoded_source: string, encoded_target: string, token: string, amount: number, epoch: number, fee_amount: number, gas_limit: number, tx_code: Uint8Array): any;
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
* Derive a child account
* @param {string} path
* @param {string} child
* @returns {any}
*/
  derive(path: string, child: string): any;
/**
* Derive extended keys from a seed and a path
* @param {string} path
* @returns {Bip32Keys}
*/
  make_extended_keys(path: string): Bip32Keys;
/**
* Get serialized Wallet
* @returns {any}
*/
  serialize(): any;
/**
* Serializable extended keys
* @param {string} path
* @returns {any}
*/
  extended_keys(path: string): any;
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
  readonly __wbg_bip32keys_free: (a: number) => void;
  readonly wallet_new: (a: number, b: number, c: number, d: number) => number;
  readonly wallet_derive: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly wallet_make_extended_keys: (a: number, b: number, c: number) => number;
  readonly wallet_serialize: (a: number, b: number) => void;
  readonly wallet_extended_keys: (a: number, b: number, c: number, d: number) => void;
  readonly __wbg_address_free: (a: number) => void;
  readonly address_encoded: (a: number, b: number) => void;
  readonly address_from_keypair: (a: number) => number;
  readonly address_decode: (a: number, b: number, c: number) => void;
  readonly account_init: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => void;
  readonly run: () => void;
  readonly __wbg_tx_free: (a: number) => void;
  readonly __wbg_wrappertx_free: (a: number) => void;
  readonly __wbg_keypair_free: (a: number) => void;
  readonly keypair_serialize: (a: number) => number;
  readonly keypair_deserialize: (a: number, b: number) => void;
  readonly keypair_to_bytes: (a: number, b: number) => void;
  readonly transfer_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number) => void;
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
