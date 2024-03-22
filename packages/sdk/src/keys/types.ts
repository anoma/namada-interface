/**
 * Address and public key type
 */
export type Address = {
  address: string;
  publicKey: string;
};

/**
 * Public and private keypair with address
 */
export type TransparentKeys = {
  privateKey: string;
} & Address;

/**
 * Shielded keys and address
 */
export type ShieldedKeys = {
  address: string;
  viewingKey: string;
  spendingKey: string;
};
