/* tslint:disable */
/* eslint-disable */
/**
* @param {any} shielded_transactions
* @param {string | undefined} spending_key_as_string
* @param {string} payment_address_as_string
* @param {string} token_address
* @param {bigint} amount
* @param {Uint8Array} spend_param_bytes
* @param {Uint8Array} output_param_bytes
* @returns {Uint8Array | undefined}
*/
export function create_shielded_transfer(shielded_transactions: any, spending_key_as_string: string | undefined, payment_address_as_string: string, token_address: string, amount: bigint, spend_param_bytes: Uint8Array, output_param_bytes: Uint8Array): Uint8Array | undefined;
/**
* @param {any} shielded_transactions
* @param {string} spending_key_as_string
* @param {string} token_address
* @returns {bigint | undefined}
*/
export function get_shielded_balance(shielded_transactions: any, spending_key_as_string: string, token_address: string): bigint | undefined;
/**
* @param {string} alias
* @param {string} seed_phrase
* @param {string | undefined} password
* @returns {any}
*/
export function create_master_shielded_account(alias: string, seed_phrase: string, password?: string): any;
/**
* @param {string} alias
* @param {string} path
* @param {string | undefined} password
* @returns {any}
*/
export function create_derived_shielded_account(alias: string, path: string, password?: string): any;

type ShieldedAccountType = {
    viewing_key: string;
    spending_key: string;
    payment_address: string;
}


/**
*/
export class NodeWithNextId {
  free(): void;
/**
* @param {Uint8Array} transfer_as_byte_array
* @returns {any}
*/
  static decode_transaction_with_next_tx_id(transfer_as_byte_array: Uint8Array): any;
}
export class ShieldedAccount {
  free(): void;
/**
* @param {string} alias
* @param {string} seed
* @param {string | undefined} password
* @returns {any}
*/
  static new_master_account(alias: string, seed: string, password?: string): any;
/**
* @param {string} alias
* @param {string} path
* @param {string | undefined} password
* @returns {any}
*/
  static new_derived_account(alias: string, path: string, password?: string): any;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly create_shielded_transfer: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number) => void;
  readonly get_shielded_balance: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly create_master_shielded_account: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly create_derived_shielded_account: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly shieldedaccount_new_master_account: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly shieldedaccount_new_derived_account: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly __wbg_nodewithnextid_free: (a: number) => void;
  readonly nodewithnextid_decode_transaction_with_next_tx_id: (a: number, b: number) => number;
  readonly rustsecp256k1_v0_4_1_context_create: (a: number) => number;
  readonly rustsecp256k1_v0_4_1_context_destroy: (a: number) => void;
  readonly rustsecp256k1_v0_4_1_default_illegal_callback_fn: (a: number, b: number) => void;
  readonly rustsecp256k1_v0_4_1_default_error_callback_fn: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
}

/**
* Synchronously compiles the given `bytes` and instantiates the WebAssembly module.
*
* @param {BufferSource} bytes
*
* @returns {InitOutput}
*/
export function initSync(bytes: BufferSource): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
