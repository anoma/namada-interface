<h1> masp-web </h1>

This package contains the rust code for dealing with MASP transactions in the web client through WASM. In it's current state it implements most of the high level logic of scanning, decrypring and generating of shielded transfers. It also checks the balance of a certain viewing key. Lot's of this code is based on the implementation in anoma code found under aaa and eventually there should be just one set of code for this functionality in which case this package will become significantly more light.
- [How to use](#how-to-use)
- [Important concepts and types](#important-concepts-and-types)
- [Codebase](#codebase)

## How to use
```bash
# build the project and copy files to src/utils/masp-web
./scripts/build.sh

# on ARM based Mac do this instead
CC=/opt/homebrew/opt/llvm/bin/clang AR=/opt/homebrew/opt/llvm/bin/llvm-ar && ./scripts/build.sh

# This package is then used as a dependency in the consumer
```

## Important concepts and types
* **ShieldedAccount** - this contains 3 fields that make the shielded account: `viewing_key`, `spending_key`, `payment_address`
* **viewing_key** - this can be used to decrypt a shielded transaction for viewing it's details, it cannot be used to create a new spend
* **spending_key** - on top of being able to decrypt and view details of a encrypted Note, can be used to create new spends
* **payment_address** - the target for a Note
* **shielded transfer** - to create a new shielded transfer, ones needs all the existing encrypted shielded transactions. The 1st step is to collect enough unspent funds from the shielded transfers that can be decrypted by the account that is creating the transfer
* **NodeWithNextId** - this represents shielded transaction that was fetched by TypeScript as a byte array and was transformed in Rust. It contains the borsh encrypted ShieldedTransaction as byte array and a string to indicate the id of the next shielded transaction. This is util where the next id is extracted in Rust but this object is then passed back to TypeScript so that the next transaction can be fetched. These form a linked list which is all the shielded transactions on the ledger. For now these are always fetched but we should persist these to the client, so that a client has to fetch them only once. Maybe we can also find other optimizations as it does not feel very scalable of having to fetch all of these for a new (low power mobile device behind a poor internet connection) client that wants to use shielded transactions
* **Sapling Note** - as defined in 3.2 in Zcash Protocol Specification https://github.com/zcash/zips/blob/main/protocol/sapling.pdf. It is what is roughly meant in this document, when speaking about a shielded transfer. It contains among other information the value of the note and the recipients payment address. These can only be decrypted with the viewing and spending keys

## Codebase
There are 2 main parts of in this code:
* `masp-web/lib` The rust code
  * exposes 2 functions for creating shielded transfers and querying the balance: `create_shielded_transfer`, `get_shielded_balance`, both takes arrays of `NodeWithNextId` to perform actions on
  * exposes `decode_transaction_with_next_tx_id` for transfering the existing shielded transfers that were fetched by TypeScript
  * contains logic for parsing and transforming past transactions
  * contains logic for getting balance of an account
  * Logic for creating a shielded transfer
* `masp-web/src` The TypeScript code that is being used as a dependency in the consumer
  * contains anything that the outside world should access from this package