# Accounts
This part takes care of lots of the business logic and state management for the accounts. The account represents an aliased address per token in the wallet. There are 2 main categories of accounts transparent and shielded. Examples:

* transparent - XAN
* transparent - BTC
* shielded - XAN
* shielded - BTC

## Transparent
The logic in creating the accounts is different between transparent and shielded ones. The shielded ones require us to create a key pair and communicate the account to the ledger, at which point the account becomes `established`.

## Shielded
For the shielded accounts we simply create: 
* `payment_address` - shielded transactions are sent to this
* `spending_key` - this is used to create new transfers
* `viewing_key` - this is used to decrypt the transfers to and from a shielded account

## The code

### `actions`
* `createShieldedAccount` - creates a new shielded account with the 3 above mentioned keys and adds it to the state under `state/accounts`
* `updateShieldedBalances` - performs the updating of shielded balances in the client

## TODOs & hacks
* add the following actions
  * `deleteShieldedAccount` - delete a shielded account after having
  * `displaySeedPhrase` - retrieves the seed phrase in clean text
  * `changeAlias` - changes an alias of a shielded account
* refactor the transparent and shielded accounts together
* maybe move all the stuff from `src/slices/shieldedTransfers` here, likely it does not need its own place
* clean up the data models