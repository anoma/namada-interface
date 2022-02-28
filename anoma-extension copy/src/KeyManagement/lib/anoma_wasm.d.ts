/* tslint:disable */
/* eslint-disable */
/**
* @param {number} size
* @returns {string}
*/
export function generate_mnemonic(size: number): string;
/**
* @param {any} serialized_keypair
* @param {Uint8Array} data
* @returns {Uint8Array}
*/
export function sign(serialized_keypair: any, data: Uint8Array): Uint8Array;
/**
* @param {PublicKey} pk
* @param {Uint8Array} data
* @param {Uint8Array} signature_bytes
*/
export function verify_signature(pk: PublicKey, data: Uint8Array, signature_bytes: Uint8Array): void;
/**
* @param {any} serialized_keypair
* @param {string} encoded_target
* @param {string} token
* @param {BigInt} amount
* @param {Uint8Array} tx_code
* @returns {Tx}
*/
export function make_transfer(serialized_keypair: any, encoded_target: string, token: string, amount: BigInt, tx_code: Uint8Array): Tx;
/**
*/
export enum PhraseSize {
  N12,
  N24,
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
* @param {string} mnemonic
* @param {number} iterations
* @returns {Keypair}
*/
  static from_mnemonic(mnemonic: string, iterations: number): Keypair;
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
/**
*/
export class Signature {
  free(): void;
/**
* @returns {Uint8Array}
*/
  serialize(): Uint8Array;
/**
* @param {Uint8Array} encoded
* @returns {Signature}
*/
  static deserialize(encoded: Uint8Array): Signature;
}
/**
*/
export class Tx {
  free(): void;
}
