# Anoma Extension

## How to run
```bash
# at the root

# rebuild and copy libs
./scripts/build-rust.sh

# run the test suite
yarn jest
```

## Types

### `Mnemonic`
### `KeyPair`
 * This is the keypair that is being used to sign transactions.
 * It can be encrypted or unencrypted.
 * It has the format that is suitable for file storage and is same as in the CLI. Example:
```toml
[keys]
memas-key-2 = "unencrypted:20000000f9e3191d096de7449f03fbfd03031f6b7ec23f1a048a53cbdb545c115a3b293e2000000095b922ce1f3b69b60dd8949867be8694703509ef8a20ec83e436aa08a22edda4"
memas-key-1 = "encrypted:ec5d6c48eb2e27423533f56d4fcea010d6711055fda0f3bd146b555e88ef4bf5e3ec447bab58537e55c2ff87aa9e5e08cf41db3f472d55fa766fa48bf122004e6ab4421142329055989bdf51bd2307a2fe24f0babea4bceb90eee91347188e3b6f0f23d1e3fff690f10ebd1c593d2167c773baf2967b60fde51c71cae64c6b3c"
```

### `KeyPairType`
### `Mnemonic`