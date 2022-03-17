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
