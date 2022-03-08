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
/**
* @param {string} phrase
* @param {string} password
* @returns {any}
*/
  static seed_from_mnemonic(phrase: string, password: string): any;
/**
* Derive a child account
* @param {string} phrase
* @param {string} password
* @param {string} path
* @param {number} child
* @returns {any}
*/
  static derive(phrase: string, password: string, path: string, child: number): any;
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
export class WrapperTx {
  free(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly account_init: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => void;
  readonly account_seed_from_mnemonic: (a: number, b: number, c: number, d: number) => number;
  readonly account_derive: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => void;
  readonly run: () => void;
  readonly __wbg_tx_free: (a: number) => void;
  readonly __wbg_wrappertx_free: (a: number) => void;
  readonly __wbg_keypair_free: (a: number) => void;
  readonly keypair_serialize: (a: number) => number;
  readonly keypair_deserialize: (a: number, b: number) => void;
  readonly keypair_to_bytes: (a: number, b: number) => void;
  readonly transfer_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number) => void;
  readonly __wbg_address_free: (a: number) => void;
  readonly address_encoded: (a: number, b: number) => void;
  readonly address_from_keypair: (a: number) => number;
  readonly address_decode: (a: number, b: number, c: number) => void;
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
