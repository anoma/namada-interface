## Using JSON RPC to Communicate with Ledger

**TODO** The following will soon be irrelevant, as this will be a feature of the SDK and not handled manually as in the following:

To query values from the ledger, the web-wallet must issue JSON RPC calls to the **Tendermint** `abci_query` endpoint over HTTP, which if running the ledger locally, would look like:

```
http://localhost:26657/abci_query/
```

To handle this in the wallet, we can make use of existing functionality from `cosmjs` for `RpcClient`.

### RPC HTTP Client

Over HTTP, using the `abci_query` endpoint, we can query the ledger by providing a `path` to the storage value we wish to query. Here are some examples:

- Query balance: `value/#{token_address}/balance/#{owner_address}`
- Query epoch: `epoch`
- Is known address?: `has_key/#{address}/?`

There are many other types of queries in addition to `abci_query` that can be issued to Tendermint. See [https://docs.tendermint.com/master/rpc/](https://docs.tendermint.com/master/rpc/) for more information.
