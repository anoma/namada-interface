# Shielded Transactions

Performing shielded transactions is a rather involved process. Below is a description about it.

## What is going on here
The flow to create shielded transactions is roughly this:
1. fetch the first shielded transction
2. get the id of the next shielded transaction and store the transaction as a byte array
4. fetch the next based on the id from the previous step, take again the next if exist and store transaction as a byte array
5. repeat until we have them all
6. call the function to generate the shielde transaction passing in the stored shielded transactions

## `actions`
None under this folder, the actions for performing a `shieldedTransfer` is in the parent folder under `src/slices/transfers.ts` better to move it here or likely even better is to merge all the content of this folder to `src/slices/accounts` so that all account related logic is together as it is all pretty interconnected.

## `utils`
The idea of this folder is to hide a bit of the ugliness that is needed currently when using the wasm code so that the action can focus on coordinating the calls.

## TODOs & hacks
* the proving part in the above is only using one thread so it is slow
