# Shielded Transactions

## What is going on here
The flow to create shielded transactions is roughly this:
1. fetch the first shielded transction
2. get the id of the next shielded transaction and store the transaction as a byte array
4. fetch the next based on the id from the previous step, take again the next if exist and store transaction as a byte array
5. repeat until we have them all
6. call the function to generate the shielde transaction passing in the stored shielded transactions

## current issues and hacks
* the proving part in the above is only using one thread so it is slow