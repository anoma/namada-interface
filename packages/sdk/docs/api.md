## Classes

<dl>
<dt><a href="#Keys">Keys</a></dt>
<dd></dd>
<dt><a href="#Ledger">Ledger</a></dt>
<dd><p>Functionality for interacting with NamadaApp for Ledger Hardware Wallets</p></dd>
<dt><a href="#Masp">Masp</a></dt>
<dd><p>Class representing utilities related to MASP</p></dd>
<dt><a href="#Mnemonic">Mnemonic</a></dt>
<dd><p>Class for accessing mnemonic functionality from wasm</p></dd>
<dt><a href="#Rpc">Rpc</a></dt>
<dd><p>API for executing RPC requests with Namada</p></dd>
<dt><a href="#Sdk">Sdk</a></dt>
<dd><p>API for interacting with Namada SDK</p></dd>
<dt><a href="#Signing">Signing</a></dt>
<dd><p>Non-Tx signing functions</p></dd>
<dt><a href="#Tx">Tx</a></dt>
<dd><p>SDK functionality related to transactions</p></dd>
<dt><a href="#EncodedTx">EncodedTx</a></dt>
<dd><p>Wrap results of tx building along with TxMsg</p></dd>
<dt><a href="#SignedTx">SignedTx</a></dt>
<dd></dd>
</dl>

## Members

<dl>
<dt><a href="#initLedgerUSBTransport">initLedgerUSBTransport</a> ⇒ <code>Transport</code></dt>
<dd><p>Initialize HID transport</p></dd>
<dt><a href="#EncodedTx">EncodedTx</a></dt>
<dd><p>Wrap results of tx signing to simplify passing between Sdk functions</p></dd>
</dl>

## Functions

<dl>
<dt><a href="#initAsync">initAsync(url, [token])</a> ⇒ <code><a href="#Sdk">Sdk</a></code></dt>
<dd><p>Returns an initialized Sdk class asynchronously. This is required to use
this library in web applications.</p></dd>
<dt><a href="#initSync">initSync(url, nativeToken)</a> ⇒ <code><a href="#Sdk">Sdk</a></code></dt>
<dd><p>Initialize SDK for Node JS environments</p></dd>
<dt><a href="#initLedgerUSBTransport">initLedgerUSBTransport()</a> ⇒ <code>Transport</code></dt>
<dd><p>Initialize USB transport</p></dd>
</dl>

<a name="Keys"></a>

## Keys
**Kind**: global class  

* [Keys](#Keys)
    * [new Keys(cryptoMemory)](#new_Keys_new)
    * [.getAddress(privateKey)](#Keys+getAddress) ⇒
    * [.fromPrivateKey(privateKey)](#Keys+fromPrivateKey) ⇒
    * [.deriveFromMnemonic(phrase, [path], [passphrase])](#Keys+deriveFromMnemonic) ⇒
    * [.deriveFromSeed(seed, [path])](#Keys+deriveFromSeed) ⇒
    * [.deriveShielded(seed, [path])](#Keys+deriveShielded) ⇒

<a name="new_Keys_new"></a>

### new Keys(cryptoMemory)

| Param | Description |
| --- | --- |
| cryptoMemory | <p>Memory accessor for crypto lib</p> |

<a name="Keys+getAddress"></a>

### keys.getAddress(privateKey) ⇒
<p>Get address and public key from private key</p>

**Kind**: instance method of [<code>Keys</code>](#Keys)  
**Returns**: <p>Address and public key</p>  

| Param | Description |
| --- | --- |
| privateKey | <p>Private key</p> |

<a name="Keys+fromPrivateKey"></a>

### keys.fromPrivateKey(privateKey) ⇒
<p>Get transparent keys and address from private key</p>

**Kind**: instance method of [<code>Keys</code>](#Keys)  
**Returns**: <p>Keys and address</p>  

| Param | Description |
| --- | --- |
| privateKey | <p>Private key</p> |

<a name="Keys+deriveFromMnemonic"></a>

### keys.deriveFromMnemonic(phrase, [path], [passphrase]) ⇒
<p>Derive transparent keys and address from a mnemonic and path</p>

**Kind**: instance method of [<code>Keys</code>](#Keys)  
**Returns**: <p>Keys and address</p>  

| Param | Description |
| --- | --- |
| phrase | <p>Mnemonic phrase</p> |
| [path] | <p>Bip44 path object</p> |
| [passphrase] | <p>Bip39 passphrase</p> |

<a name="Keys+deriveFromSeed"></a>

### keys.deriveFromSeed(seed, [path]) ⇒
<p>Derive transparent keys and address from a seed and path</p>

**Kind**: instance method of [<code>Keys</code>](#Keys)  
**Returns**: <p>Keys and address</p>  

| Param | Description |
| --- | --- |
| seed | <p>Seed</p> |
| [path] | <p>Bip44 path object</p> |

<a name="Keys+deriveShielded"></a>

### keys.deriveShielded(seed, [path]) ⇒
<p>Derive shielded keys and address from a seed and path</p>

**Kind**: instance method of [<code>Keys</code>](#Keys)  
**Returns**: <p>Shielded keys and address</p>  

| Param | Description |
| --- | --- |
| seed | <p>Seed</p> |
| [path] | <p>Bip44 path object</p> |

<a name="Ledger"></a>

## Ledger
<p>Functionality for interacting with NamadaApp for Ledger Hardware Wallets</p>

**Kind**: global class  

* [Ledger](#Ledger)
    * [new Ledger(namadaApp)](#new_Ledger_new)
    * _instance_
        * [.status()](#Ledger+status) ⇒ <code>LedgerStatus</code>
        * [.getAddressAndPublicKey([path])](#Ledger+getAddressAndPublicKey) ⇒ <code>AddressAndPublicKey</code>
        * [.showAddressAndPublicKey([path])](#Ledger+showAddressAndPublicKey) ⇒ <code>AddressAndPublicKey</code>
        * [.sign(tx, [path])](#Ledger+sign) ⇒ <code>ResponseSign</code>
        * [.queryErrors()](#Ledger+queryErrors) ⇒ <code>string</code>
        * [.closeTransport()](#Ledger+closeTransport) ⇒ <code>void</code>
    * _static_
        * [.init([transport])](#Ledger.init) ⇒ [<code>Ledger</code>](#Ledger)

<a name="new_Ledger_new"></a>

### new Ledger(namadaApp)

| Param | Type | Description |
| --- | --- | --- |
| namadaApp | <code>NamadaApp</code> | <p>Inititalized NamadaApp class from Zondax package</p> |

<a name="Ledger+status"></a>

### ledger.status() ⇒ <code>LedgerStatus</code>
<p>Return status and version info of initialized NamadaApp.
Throw exception if app is not initialized.</p>

**Kind**: instance method of [<code>Ledger</code>](#Ledger)  
**Returns**: <code>LedgerStatus</code> - <p>Version and info of NamadaApp</p>  
<a name="Ledger+getAddressAndPublicKey"></a>

### ledger.getAddressAndPublicKey([path]) ⇒ <code>AddressAndPublicKey</code>
<p>Get address and public key associated with optional path, otherwise, use default path
Throw exception if app is not initialized.</p>

**Kind**: instance method of [<code>Ledger</code>](#Ledger)  
**Returns**: <code>AddressAndPublicKey</code> - <p>Address and public key</p>  

| Param | Type | Description |
| --- | --- | --- |
| [path] | <code>string</code> | <p>Bip44 path for deriving key</p> |

<a name="Ledger+showAddressAndPublicKey"></a>

### ledger.showAddressAndPublicKey([path]) ⇒ <code>AddressAndPublicKey</code>
<p>Prompt user to get address and public key associated with optional path, otherwise, use default path.
Throw exception if app is not initialized.</p>

**Kind**: instance method of [<code>Ledger</code>](#Ledger)  
**Returns**: <code>AddressAndPublicKey</code> - <p>Address and public key</p>  

| Param | Type | Description |
| --- | --- | --- |
| [path] | <code>string</code> | <p>Bip44 path for deriving key</p> |

<a name="Ledger+sign"></a>

### ledger.sign(tx, [path]) ⇒ <code>ResponseSign</code>
<p>Sign tx bytes with the key associated with the provided (or default) path.
Throw exception if app is not initialized.</p>

**Kind**: instance method of [<code>Ledger</code>](#Ledger)  
**Returns**: <code>ResponseSign</code> - <p>Response signature</p>  

| Param | Type | Description |
| --- | --- | --- |
| tx | <code>Uint8Array</code> | <p>tx data blob to sign</p> |
| [path] | <code>string</code> | <p>Bip44 path for signing account</p> |

<a name="Ledger+queryErrors"></a>

### ledger.queryErrors() ⇒ <code>string</code>
<p>Query status to determine if device has thrown an error.
Throw exception if app is not initialized.</p>

**Kind**: instance method of [<code>Ledger</code>](#Ledger)  
**Returns**: <code>string</code> - <p>Error message if error is found</p>  
<a name="Ledger+closeTransport"></a>

### ledger.closeTransport() ⇒ <code>void</code>
<p>Close the initialized transport, which may be needed if Ledger needs to be reinitialized due to error state
Throw exception if app is not initialized.</p>

**Kind**: instance method of [<code>Ledger</code>](#Ledger)  
<a name="Ledger.init"></a>

### Ledger.init([transport]) ⇒ [<code>Ledger</code>](#Ledger)
<p>Initialize and return Ledger class instance with initialized Transport</p>

**Kind**: static method of [<code>Ledger</code>](#Ledger)  
**Returns**: [<code>Ledger</code>](#Ledger) - <p>Ledger class instance</p>  

| Param | Type | Description |
| --- | --- | --- |
| [transport] | <code>Transport</code> | <p>Ledger transport</p> |

<a name="Masp"></a>

## Masp
<p>Class representing utilities related to MASP</p>

**Kind**: global class  

* [Masp](#Masp)
    * [new Masp(sdk)](#new_Masp_new)
    * [.hasMaspParams()](#Masp+hasMaspParams) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.fetchAndStoreMaspParams()](#Masp+fetchAndStoreMaspParams) ⇒ <code>void</code>
    * [.loadMaspParams()](#Masp+loadMaspParams) ⇒ <code>void</code>
    * [.addSpendingKey(xsk, alias)](#Masp+addSpendingKey) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="new_Masp_new"></a>

### new Masp(sdk)

| Param | Type | Description |
| --- | --- | --- |
| sdk | <code>SdkWasm</code> | <p>Instance of Sdk struct from wasm lib</p> |

<a name="Masp+hasMaspParams"></a>

### masp.hasMaspParams() ⇒ <code>Promise.&lt;boolean&gt;</code>
<p>Check if SDK has MASP parameters loaded</p>

**Kind**: instance method of [<code>Masp</code>](#Masp)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - <p>True if MASP parameters are loaded</p>  
<a name="Masp+fetchAndStoreMaspParams"></a>

### masp.fetchAndStoreMaspParams() ⇒ <code>void</code>
<p>Fetch MASP parameters and store them in SDK</p>

**Kind**: instance method of [<code>Masp</code>](#Masp)  
<a name="Masp+loadMaspParams"></a>

### masp.loadMaspParams() ⇒ <code>void</code>
<p>Load stored MASP params</p>

**Kind**: instance method of [<code>Masp</code>](#Masp)  
<a name="Masp+addSpendingKey"></a>

### masp.addSpendingKey(xsk, alias) ⇒ <code>Promise.&lt;void&gt;</code>
<p>Add spending key to SDK wallet</p>

**Kind**: instance method of [<code>Masp</code>](#Masp)  

| Param | Type | Description |
| --- | --- | --- |
| xsk | <code>string</code> | <p>extended spending key</p> |
| alias | <code>string</code> | <p>alias for the key</p> |

<a name="Mnemonic"></a>

## Mnemonic
<p>Class for accessing mnemonic functionality from wasm</p>

**Kind**: global class  

* [Mnemonic](#Mnemonic)
    * [new Mnemonic(cryptoMemory)](#new_Mnemonic_new)
    * [.generate([size])](#Mnemonic+generate) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [.toSeed(phrase, [passphrase])](#Mnemonic+toSeed) ⇒ <code>Uint8Array</code>
    * [.validateMnemonic(phrase)](#Mnemonic+validateMnemonic) ⇒ <code>void</code>

<a name="new_Mnemonic_new"></a>

### new Mnemonic(cryptoMemory)

| Param | Type | Description |
| --- | --- | --- |
| cryptoMemory | <code>WebAssembly.Memory</code> | <p>Memory accessor for crypto lib</p> |

<a name="Mnemonic+generate"></a>

### mnemonic.generate([size]) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
<p>Generate a new 12 or 24 word mnemonic</p>

**Kind**: instance method of [<code>Mnemonic</code>](#Mnemonic)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - <p>Promise that resolves to array of words</p>  

| Param | Type | Description |
| --- | --- | --- |
| [size] | <code>PhraseSize</code> | <p>Mnemonic length</p> |

<a name="Mnemonic+toSeed"></a>

### mnemonic.toSeed(phrase, [passphrase]) ⇒ <code>Uint8Array</code>
<p>Convert mnemonic to seed bytes</p>

**Kind**: instance method of [<code>Mnemonic</code>](#Mnemonic)  
**Returns**: <code>Uint8Array</code> - <p>Seed bytes</p>  

| Param | Type | Description |
| --- | --- | --- |
| phrase | <code>string</code> | <p>Mnemonic phrase</p> |
| [passphrase] | <code>string</code> | <p>Bip39 passphrase</p> |

<a name="Mnemonic+validateMnemonic"></a>

### mnemonic.validateMnemonic(phrase) ⇒ <code>void</code>
<p>Validate a mnemonic string, raise an exception providing reason
for failure if invalid, otherwise return nothing</p>

**Kind**: instance method of [<code>Mnemonic</code>](#Mnemonic)  

| Param | Type | Description |
| --- | --- | --- |
| phrase | <code>string</code> | <p>Mnemonic phrase</p> |

<a name="Rpc"></a>

## Rpc
<p>API for executing RPC requests with Namada</p>

**Kind**: global class  

* [Rpc](#Rpc)
    * [new Rpc(sdk, query)](#new_Rpc_new)
    * [.queryBalance(owner, tokens)](#Rpc+queryBalance) ⇒ <code>Balance</code>
    * [.queryNativeToken()](#Rpc+queryNativeToken) ⇒ <code>string</code>
    * [.queryPublicKey(address)](#Rpc+queryPublicKey) ⇒ <code>string</code> \| <code>null</code>
    * [.queryAllValidators()](#Rpc+queryAllValidators) ⇒ <code>Array.&lt;string&gt;</code>
    * [.queryProposals()](#Rpc+queryProposals) ⇒ <code>Array.&lt;Proposal&gt;</code>
    * [.queryTotalDelegations(owners, [epoch])](#Rpc+queryTotalDelegations) ⇒ <code>Promise.&lt;DelegationTotals&gt;</code>
    * [.queryDelegatorsVotes(proposalId)](#Rpc+queryDelegatorsVotes) ⇒ <code>Promise.&lt;DelegatorsVotes&gt;</code>
    * [.queryStakingTotals(owners)](#Rpc+queryStakingTotals) ⇒ <code>Promise.&lt;Array.&lt;StakingTotals&gt;&gt;</code>
    * [.queryStakingPositions(owners)](#Rpc+queryStakingPositions) ⇒ <code>Promise.&lt;StakingPositions&gt;</code>
    * [.queryTotalBonds(owner)](#Rpc+queryTotalBonds) ⇒ <code>Promise.&lt;number&gt;</code>
    * [.querySignedBridgePool(owners)](#Rpc+querySignedBridgePool) ⇒ <code>Promise.&lt;Array.&lt;TransferToEthereum&gt;&gt;</code>
    * [.queryGasCosts()](#Rpc+queryGasCosts) ⇒ <code>Promise.&lt;GasCosts&gt;</code>
    * [.broadcastTx(signedTx)](#Rpc+broadcastTx) ⇒ <code>void</code>

<a name="new_Rpc_new"></a>

### new Rpc(sdk, query)

| Param | Type | Description |
| --- | --- | --- |
| sdk | <code>SdkWasm</code> | <p>Instance of Sdk struct from wasm lib</p> |
| query | <code>QueryWasm</code> | <p>Instance of Query struct from wasm lib</p> |

<a name="Rpc+queryBalance"></a>

### rpc.queryBalance(owner, tokens) ⇒ <code>Balance</code>
<p>Query balances from chain</p>

**Kind**: instance method of [<code>Rpc</code>](#Rpc)  
**Returns**: <code>Balance</code> - <p>[[tokenAddress, amount]]</p>  

| Param | Type | Description |
| --- | --- | --- |
| owner | <code>string</code> | <p>Owner address</p> |
| tokens | <code>Array.&lt;string&gt;</code> | <p>Array of token addresses</p> |

<a name="Rpc+queryNativeToken"></a>

### rpc.queryNativeToken() ⇒ <code>string</code>
<p>Query native token from chain</p>

**Kind**: instance method of [<code>Rpc</code>](#Rpc)  
**Returns**: <code>string</code> - <p>Address of native token</p>  
<a name="Rpc+queryPublicKey"></a>

### rpc.queryPublicKey(address) ⇒ <code>string</code> \| <code>null</code>
<p>Query public key
Return string of public key if it has been revealed on chain, otherwise, return null</p>

**Kind**: instance method of [<code>Rpc</code>](#Rpc)  
**Returns**: <code>string</code> \| <code>null</code> - <p>String of public key if found</p>  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | <p>Address to query</p> |

<a name="Rpc+queryAllValidators"></a>

### rpc.queryAllValidators() ⇒ <code>Array.&lt;string&gt;</code>
<p>Query all validator addresses</p>

**Kind**: instance method of [<code>Rpc</code>](#Rpc)  
**Returns**: <code>Array.&lt;string&gt;</code> - <p>Array of all validator addresses</p>  
<a name="Rpc+queryProposals"></a>

### rpc.queryProposals() ⇒ <code>Array.&lt;Proposal&gt;</code>
<p>Query Proposals</p>

**Kind**: instance method of [<code>Rpc</code>](#Rpc)  
**Returns**: <code>Array.&lt;Proposal&gt;</code> - <p>List of the proposals</p>  
<a name="Rpc+queryTotalDelegations"></a>

### rpc.queryTotalDelegations(owners, [epoch]) ⇒ <code>Promise.&lt;DelegationTotals&gt;</code>
<p>Query total delegations</p>

**Kind**: instance method of [<code>Rpc</code>](#Rpc)  
**Returns**: <code>Promise.&lt;DelegationTotals&gt;</code> - <p>Promise resolving to total delegations</p>  

| Param | Type | Description |
| --- | --- | --- |
| owners | <code>Array.&lt;string&gt;</code> | <p>Array of owner addresses</p> |
| [epoch] | <code>bigint</code> | <p>delegations at epoch</p> |

<a name="Rpc+queryDelegatorsVotes"></a>

### rpc.queryDelegatorsVotes(proposalId) ⇒ <code>Promise.&lt;DelegatorsVotes&gt;</code>
<p>Query delegators votes</p>

**Kind**: instance method of [<code>Rpc</code>](#Rpc)  
**Returns**: <code>Promise.&lt;DelegatorsVotes&gt;</code> - <p>Promise resolving to delegators votes</p>  

| Param | Type | Description |
| --- | --- | --- |
| proposalId | <code>bigint</code> | <p>ID of the proposal</p> |

<a name="Rpc+queryStakingTotals"></a>

### rpc.queryStakingTotals(owners) ⇒ <code>Promise.&lt;Array.&lt;StakingTotals&gt;&gt;</code>
<p>Query staking totals by owner addresses</p>

**Kind**: instance method of [<code>Rpc</code>](#Rpc)  
**Returns**: <code>Promise.&lt;Array.&lt;StakingTotals&gt;&gt;</code> - <p>Promise resolving to staking totals</p>  

| Param | Type | Description |
| --- | --- | --- |
| owners | <code>Array.&lt;string&gt;</code> | <p>Array of owner addresses</p> |

<a name="Rpc+queryStakingPositions"></a>

### rpc.queryStakingPositions(owners) ⇒ <code>Promise.&lt;StakingPositions&gt;</code>
<p>Query bond and unbond details by owner addresses</p>

**Kind**: instance method of [<code>Rpc</code>](#Rpc)  
**Returns**: <code>Promise.&lt;StakingPositions&gt;</code> - <p>Promise resolving to staking positions</p>  

| Param | Type | Description |
| --- | --- | --- |
| owners | <code>Array.&lt;string&gt;</code> | <p>Array of owner addresses</p> |

<a name="Rpc+queryTotalBonds"></a>

### rpc.queryTotalBonds(owner) ⇒ <code>Promise.&lt;number&gt;</code>
<p>Query total bonds by owner address</p>

**Kind**: instance method of [<code>Rpc</code>](#Rpc)  
**Returns**: <code>Promise.&lt;number&gt;</code> - <p>Total bonds amount</p>  

| Param | Type | Description |
| --- | --- | --- |
| owner | <code>string</code> | <p>Owner address</p> |

<a name="Rpc+querySignedBridgePool"></a>

### rpc.querySignedBridgePool(owners) ⇒ <code>Promise.&lt;Array.&lt;TransferToEthereum&gt;&gt;</code>
<p>Query pending transactions in the signed bridge pool</p>

**Kind**: instance method of [<code>Rpc</code>](#Rpc)  
**Returns**: <code>Promise.&lt;Array.&lt;TransferToEthereum&gt;&gt;</code> - <p>Promise resolving to pending ethereum transfers</p>  

| Param | Type | Description |
| --- | --- | --- |
| owners | <code>Array.&lt;string&gt;</code> | <p>Array of owner addresses</p> |

<a name="Rpc+queryGasCosts"></a>

### rpc.queryGasCosts() ⇒ <code>Promise.&lt;GasCosts&gt;</code>
<p>Query gas costs</p>

**Kind**: instance method of [<code>Rpc</code>](#Rpc)  
**Returns**: <code>Promise.&lt;GasCosts&gt;</code> - <p>[[tokenAddress, gasCost]]</p>  
<a name="Rpc+broadcastTx"></a>

### rpc.broadcastTx(signedTx) ⇒ <code>void</code>
<p>Broadcast a Tx to the ledger</p>

**Kind**: instance method of [<code>Rpc</code>](#Rpc)  

| Param | Type | Description |
| --- | --- | --- |
| signedTx | [<code>SignedTx</code>](#SignedTx) | <p>Transaction with signature</p> |

<a name="Sdk"></a>

## Sdk
<p>API for interacting with Namada SDK</p>

**Kind**: global class  

* [Sdk](#Sdk)
    * [new Sdk(sdk, query, cryptoMemory, url, nativeToken)](#new_Sdk_new)
    * _instance_
        * [.rpc](#Sdk+rpc) ⇒ [<code>Rpc</code>](#Rpc)
        * [.tx](#Sdk+tx) ⇒ [<code>Tx</code>](#Tx)
        * [.mnemonic](#Sdk+mnemonic) ⇒ [<code>Mnemonic</code>](#Mnemonic)
        * [.keys](#Sdk+keys) ⇒ [<code>Keys</code>](#Keys)
        * [.signing](#Sdk+signing) ⇒ [<code>Signing</code>](#Signing)
        * [.masp](#Sdk+masp) ⇒ [<code>Masp</code>](#Masp)
        * [.getRpc()](#Sdk+getRpc) ⇒ [<code>Rpc</code>](#Rpc)
        * [.getTx()](#Sdk+getTx) ⇒ [<code>Tx</code>](#Tx)
        * [.getMnemonic()](#Sdk+getMnemonic) ⇒ [<code>Mnemonic</code>](#Mnemonic)
        * [.getKeys()](#Sdk+getKeys) ⇒ [<code>Keys</code>](#Keys)
        * [.getSigning()](#Sdk+getSigning) ⇒ [<code>Signing</code>](#Signing)
        * [.getMasp()](#Sdk+getMasp) ⇒ [<code>Masp</code>](#Masp)
        * [.initLedger([transport])](#Sdk+initLedger) ⇒ [<code>Ledger</code>](#Ledger)
    * _static_
        * [.init(url, token)](#Sdk.init) ⇒ <code>Promise.&lt;SDK&gt;</code>

<a name="new_Sdk_new"></a>

### new Sdk(sdk, query, cryptoMemory, url, nativeToken)

| Param | Type | Description |
| --- | --- | --- |
| sdk | <code>SdkWasm</code> | <p>Instance of Sdk struct from wasm lib</p> |
| query | <code>QueryWasm</code> | <p>Instance of Query struct from wasm lib</p> |
| cryptoMemory | <code>WebAssembly.Memory</code> | <p>Memory accessor for crypto lib</p> |
| url | <code>string</code> | <p>RPC url</p> |
| nativeToken | <code>string</code> | <p>Address of chain's native token</p> |

<a name="Sdk+rpc"></a>

### sdk.rpc ⇒ [<code>Rpc</code>](#Rpc)
<p>Define rpc getter to use with destructuring assignment</p>

**Kind**: instance property of [<code>Sdk</code>](#Sdk)  
**Returns**: [<code>Rpc</code>](#Rpc) - <p>rpc client</p>  
<a name="Sdk+tx"></a>

### sdk.tx ⇒ [<code>Tx</code>](#Tx)
<p>Define tx getter to use with destructuring assignment</p>

**Kind**: instance property of [<code>Sdk</code>](#Sdk)  
**Returns**: [<code>Tx</code>](#Tx) - <p>tx-related functionality</p>  
<a name="Sdk+mnemonic"></a>

### sdk.mnemonic ⇒ [<code>Mnemonic</code>](#Mnemonic)
<p>Define mnemonic getter to use with destructuring assignment</p>

**Kind**: instance property of [<code>Sdk</code>](#Sdk)  
**Returns**: [<code>Mnemonic</code>](#Mnemonic) - <p>mnemonic-related functionality</p>  
<a name="Sdk+keys"></a>

### sdk.keys ⇒ [<code>Keys</code>](#Keys)
<p>Define keys getter to use with destructuring assignment</p>

**Kind**: instance property of [<code>Sdk</code>](#Sdk)  
**Returns**: [<code>Keys</code>](#Keys) - <p>key-related functionality</p>  
<a name="Sdk+signing"></a>

### sdk.signing ⇒ [<code>Signing</code>](#Signing)
<p>Define signing getter to use with destructuring assignment</p>

**Kind**: instance property of [<code>Sdk</code>](#Sdk)  
**Returns**: [<code>Signing</code>](#Signing) - <p>Non-Tx signing functionality</p>  
<a name="Sdk+masp"></a>

### sdk.masp ⇒ [<code>Masp</code>](#Masp)
<p>Define signing getter to use with destructuring assignment</p>

**Kind**: instance property of [<code>Sdk</code>](#Sdk)  
**Returns**: [<code>Masp</code>](#Masp) - <p>Masp utilities for handling params</p>  
<a name="Sdk+getRpc"></a>

### sdk.getRpc() ⇒ [<code>Rpc</code>](#Rpc)
<p>Return initialized Rpc class</p>

**Kind**: instance method of [<code>Sdk</code>](#Sdk)  
**Returns**: [<code>Rpc</code>](#Rpc) - <p>Namada RPC client</p>  
<a name="Sdk+getTx"></a>

### sdk.getTx() ⇒ [<code>Tx</code>](#Tx)
<p>Return initialized Tx class</p>

**Kind**: instance method of [<code>Sdk</code>](#Sdk)  
**Returns**: [<code>Tx</code>](#Tx) - <p>Tx-related functionality</p>  
<a name="Sdk+getMnemonic"></a>

### sdk.getMnemonic() ⇒ [<code>Mnemonic</code>](#Mnemonic)
<p>Return initialized Mnemonic class</p>

**Kind**: instance method of [<code>Sdk</code>](#Sdk)  
**Returns**: [<code>Mnemonic</code>](#Mnemonic) - <p>mnemonic-related functionality</p>  
<a name="Sdk+getKeys"></a>

### sdk.getKeys() ⇒ [<code>Keys</code>](#Keys)
<p>Return initialized Keys class</p>

**Kind**: instance method of [<code>Sdk</code>](#Sdk)  
**Returns**: [<code>Keys</code>](#Keys) - <p>key-related functionality</p>  
<a name="Sdk+getSigning"></a>

### sdk.getSigning() ⇒ [<code>Signing</code>](#Signing)
<p>Return initialized Signing class</p>

**Kind**: instance method of [<code>Sdk</code>](#Sdk)  
**Returns**: [<code>Signing</code>](#Signing) - <p>Non-Tx signing functionality</p>  
<a name="Sdk+getMasp"></a>

### sdk.getMasp() ⇒ [<code>Masp</code>](#Masp)
<p>Return initialized Masp class</p>

**Kind**: instance method of [<code>Sdk</code>](#Sdk)  
**Returns**: [<code>Masp</code>](#Masp) - <p>Masp utilities for handling params</p>  
<a name="Sdk+initLedger"></a>

### sdk.initLedger([transport]) ⇒ [<code>Ledger</code>](#Ledger)
<p>Intialize Ledger class for use with NamadaApp</p>

**Kind**: instance method of [<code>Sdk</code>](#Sdk)  
**Returns**: [<code>Ledger</code>](#Ledger) - <p>Class for interacting with NamadaApp for Ledger Hardware Wallets</p>  

| Param | Type | Description |
| --- | --- | --- |
| [transport] | <code>Transport</code> | <p>Will default to USB transport if not specified</p> |

<a name="Sdk.init"></a>

### Sdk.init(url, token) ⇒ <code>Promise.&lt;SDK&gt;</code>
<p>Initialize Sdk for web applications</p>

**Kind**: static method of [<code>Sdk</code>](#Sdk)  
**Returns**: <code>Promise.&lt;SDK&gt;</code> - <ul>
<li>Sdk instance</li>
</ul>  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | <p>node url</p> |
| token | <code>string</code> | <p>native token address</p> |

<a name="Signing"></a>

## Signing
<p>Non-Tx signing functions</p>

**Kind**: global class  

* [Signing](#Signing)
    * [.signArbitrary(signingKey, data)](#Signing+signArbitrary) ⇒ <code>Signature</code>
    * [.verifyArbitrary(publicKey, hash, signature)](#Signing+verifyArbitrary) ⇒ <code>void</code>

<a name="Signing+signArbitrary"></a>

### signing.signArbitrary(signingKey, data) ⇒ <code>Signature</code>
<p>Sign arbitrary data</p>

**Kind**: instance method of [<code>Signing</code>](#Signing)  
**Returns**: <code>Signature</code> - <p>hash and signature</p>  

| Param | Type | Description |
| --- | --- | --- |
| signingKey | <code>string</code> | <p>private key</p> |
| data | <code>string</code> | <p>data to sign</p> |

<a name="Signing+verifyArbitrary"></a>

### signing.verifyArbitrary(publicKey, hash, signature) ⇒ <code>void</code>
<p>Verify arbitrary signature. Will throw an error if the signature is invalid</p>

**Kind**: instance method of [<code>Signing</code>](#Signing)  

| Param | Type | Description |
| --- | --- | --- |
| publicKey | <code>string</code> | <p>public key to verify with</p> |
| hash | <code>string</code> | <p>signed hash</p> |
| signature | <code>signature</code> | <p>Hex-encoded signature</p> |

<a name="Tx"></a>

## Tx
<p>SDK functionality related to transactions</p>

**Kind**: global class  

* [Tx](#Tx)
    * [new Tx(sdk)](#new_Tx_new)
    * [.buildTxFromSerializedArgs(txType, encodedSpecificTx, encodedTx, gasPayer)](#Tx+buildTxFromSerializedArgs) ⇒ [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx)
    * [.buildTx(txType, txProps, props, [gasPayer])](#Tx+buildTx) ⇒ [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx)
    * [.buildTransfer(txProps, transferProps, [gasPayer])](#Tx+buildTransfer) ⇒ [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx)
    * [.buildRevealPk(txProps, publicKey)](#Tx+buildRevealPk) ⇒ [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx)
    * [.buildBond(txProps, bondProps, [gasPayer])](#Tx+buildBond) ⇒ [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx)
    * [.buildUnbond(txProps, unbondProps, [gasPayer])](#Tx+buildUnbond) ⇒ [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx)
    * [.buildWithdraw(txProps, withdrawProps, [gasPayer])](#Tx+buildWithdraw) ⇒ [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx)
    * [.buildIbcTransfer(txProps, ibcTransferProps, [gasPayer])](#Tx+buildIbcTransfer) ⇒ [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx)
    * [.buildEthBridgeTransfer(txProps, ethBridgeTransferProps, [gasPayer])](#Tx+buildEthBridgeTransfer) ⇒ [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx)
    * [.buildVoteProposal(txProps, voteProposalProps, [gasPayer])](#Tx+buildVoteProposal) ⇒ [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx)
    * [.signTx(encodedTx, [signingKey])](#Tx+signTx) ⇒ [<code>Promise.&lt;SignedTx&gt;</code>](#SignedTx)
    * [.revealPk(signingKey, txProps)](#Tx+revealPk) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.appendSignature(txBytes, ledgerSignatureResponse)](#Tx+appendSignature) ⇒ <code>Uint8Array</code>
    * [.encodeTxArgs(txProps)](#Tx+encodeTxArgs) ⇒ <code>Uint8Array</code>

<a name="new_Tx_new"></a>

### new Tx(sdk)

| Param | Type | Description |
| --- | --- | --- |
| sdk | <code>SdkWasm</code> | <p>Instance of Sdk struct from wasm lib</p> |

<a name="Tx+buildTxFromSerializedArgs"></a>

### tx.buildTxFromSerializedArgs(txType, encodedSpecificTx, encodedTx, gasPayer) ⇒ [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx)
<p>Build a transaction</p>

**Kind**: instance method of [<code>Tx</code>](#Tx)  
**Returns**: [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx) - <p>promise that resolves to an EncodedTx</p>  

| Param | Type | Description |
| --- | --- | --- |
| txType | <code>TxType</code> | <p>type of the transaction</p> |
| encodedSpecificTx | <code>Uint8Array</code> | <p>encoded specific transaction</p> |
| encodedTx | <code>Uint8Array</code> | <p>encoded transaction</p> |
| gasPayer | <code>string</code> | <p>address of the gas payer</p> |

<a name="Tx+buildTx"></a>

### tx.buildTx(txType, txProps, props, [gasPayer]) ⇒ [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx)
<p>Wrapper method to handle all supported Tx</p>

**Kind**: instance method of [<code>Tx</code>](#Tx)  
**Returns**: [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx) - <p>promise that resolves to an EncodedTx</p>  

| Param | Type | Description |
| --- | --- | --- |
| txType | <code>TxType</code> | <p>type of the transaction</p> |
| txProps | <code>TxProps</code> | <p>transaction properties</p> |
| props | <code>unknown</code> | <p>Props specific to type of Tx</p> |
| [gasPayer] | <code>string</code> | <p>optional gas payer, defaults to source or sender</p> |

<a name="Tx+buildTransfer"></a>

### tx.buildTransfer(txProps, transferProps, [gasPayer]) ⇒ [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx)
<p>Build Transfer Tx</p>

**Kind**: instance method of [<code>Tx</code>](#Tx)  
**Returns**: [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx) - <p>promise that resolves to an EncodedTx</p>  

| Param | Type | Description |
| --- | --- | --- |
| txProps | <code>TxProps</code> | <p>properties of the transaction</p> |
| transferProps | <code>TransferProps</code> | <p>properties of the transfer</p> |
| [gasPayer] | <code>string</code> | <p>optional gas payer, if not provided, defaults to transferProps.source</p> |

<a name="Tx+buildRevealPk"></a>

### tx.buildRevealPk(txProps, publicKey) ⇒ [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx)
<p>Build RevealPK Tx</p>

**Kind**: instance method of [<code>Tx</code>](#Tx)  
**Returns**: [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx) - <p>promise that resolves to an EncodedTx</p>  

| Param | Type | Description |
| --- | --- | --- |
| txProps | <code>TxProps</code> | <p>properties of the transaction</p> |
| publicKey | <code>string</code> | <p>public key to reveal</p> |

<a name="Tx+buildBond"></a>

### tx.buildBond(txProps, bondProps, [gasPayer]) ⇒ [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx)
<p>Build Bond Tx</p>

**Kind**: instance method of [<code>Tx</code>](#Tx)  
**Returns**: [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx) - <p>promise that resolves to an EncodedTx</p>  

| Param | Type | Description |
| --- | --- | --- |
| txProps | <code>TxProps</code> | <p>properties of the transaction</p> |
| bondProps | <code>BondProps</code> | <p>properties of the bond tx</p> |
| [gasPayer] | <code>string</code> | <p>optional gas payer, if not provided, defaults to bondProps.source</p> |

<a name="Tx+buildUnbond"></a>

### tx.buildUnbond(txProps, unbondProps, [gasPayer]) ⇒ [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx)
<p>Build Unbond Tx</p>

**Kind**: instance method of [<code>Tx</code>](#Tx)  
**Returns**: [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx) - <p>promise that resolves to an EncodedTx</p>  

| Param | Type | Description |
| --- | --- | --- |
| txProps | <code>TxProps</code> | <p>properties of the transaction</p> |
| unbondProps | <code>UnbondProps</code> | <p>properties of the unbond tx</p> |
| [gasPayer] | <code>string</code> | <p>optional gas payer, if not provided, defaults to unbondProps.source</p> |

<a name="Tx+buildWithdraw"></a>

### tx.buildWithdraw(txProps, withdrawProps, [gasPayer]) ⇒ [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx)
<p>Build Withdraw Tx</p>

**Kind**: instance method of [<code>Tx</code>](#Tx)  
**Returns**: [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx) - <p>promise that resolves to an EncodedTx</p>  

| Param | Type | Description |
| --- | --- | --- |
| txProps | <code>TxProps</code> | <p>properties of the transaction</p> |
| withdrawProps | <code>WithdrawProps</code> | <p>properties of the withdraw tx</p> |
| [gasPayer] | <code>string</code> | <p>optional gas payer, if not provided, defaults to withdrawProps.source</p> |

<a name="Tx+buildIbcTransfer"></a>

### tx.buildIbcTransfer(txProps, ibcTransferProps, [gasPayer]) ⇒ [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx)
<p>Build Ibc Transfer Tx</p>

**Kind**: instance method of [<code>Tx</code>](#Tx)  
**Returns**: [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx) - <p>promise that resolves to an EncodedTx</p>  

| Param | Type | Description |
| --- | --- | --- |
| txProps | <code>TxProps</code> | <p>properties of the transaction</p> |
| ibcTransferProps | <code>IbcTransferProps</code> | <p>properties of the ibc transfer tx</p> |
| [gasPayer] | <code>string</code> | <p>optional gas payer, if not provided, defaults to ibcTransferProps.source</p> |

<a name="Tx+buildEthBridgeTransfer"></a>

### tx.buildEthBridgeTransfer(txProps, ethBridgeTransferProps, [gasPayer]) ⇒ [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx)
<p>Build Ethereum Bridge Transfer Tx</p>

**Kind**: instance method of [<code>Tx</code>](#Tx)  
**Returns**: [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx) - <p>promise that resolves to an EncodedTx</p>  

| Param | Type | Description |
| --- | --- | --- |
| txProps | <code>TxProps</code> | <p>properties of the transaction</p> |
| ethBridgeTransferProps | <code>EthBridgeTransferProps</code> | <p>properties of the eth bridge transfer tx</p> |
| [gasPayer] | <code>string</code> | <p>optional gas payer, if not provided, defaults to ethBridgeTransferProps.sender</p> |

<a name="Tx+buildVoteProposal"></a>

### tx.buildVoteProposal(txProps, voteProposalProps, [gasPayer]) ⇒ [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx)
<p>Built Vote Proposal Tx</p>

**Kind**: instance method of [<code>Tx</code>](#Tx)  
**Returns**: [<code>Promise.&lt;EncodedTx&gt;</code>](#EncodedTx) - <p>promise that resolves to an EncodedTx</p>  

| Param | Type | Description |
| --- | --- | --- |
| txProps | <code>TxProps</code> | <p>properties of the transaction</p> |
| voteProposalProps | <code>VoteProposalProps</code> | <p>properties of the vote proposal tx</p> |
| [gasPayer] | <code>string</code> | <p>optional gas payer, if not provided, defaults to voteProposalProps.signer</p> |

<a name="Tx+signTx"></a>

### tx.signTx(encodedTx, [signingKey]) ⇒ [<code>Promise.&lt;SignedTx&gt;</code>](#SignedTx)
<p>Sign transaction</p>

**Kind**: instance method of [<code>Tx</code>](#Tx)  
**Returns**: [<code>Promise.&lt;SignedTx&gt;</code>](#SignedTx) - <p>promise that resolves to a SignedTx</p>  

| Param | Type | Description |
| --- | --- | --- |
| encodedTx | [<code>EncodedTx</code>](#EncodedTx) | <p>encoded transaction</p> |
| [signingKey] | <code>string</code> | <p>optional in the case of shielded tx</p> |

<a name="Tx+revealPk"></a>

### tx.revealPk(signingKey, txProps) ⇒ <code>Promise.&lt;void&gt;</code>
<p>Reveal Public Key using serialized Tx</p>

**Kind**: instance method of [<code>Tx</code>](#Tx)  

| Param | Type | Description |
| --- | --- | --- |
| signingKey | <code>string</code> | <p>signing key</p> |
| txProps | <code>TxProps</code> | <p>properties of the transaction</p> |

<a name="Tx+appendSignature"></a>

### tx.appendSignature(txBytes, ledgerSignatureResponse) ⇒ <code>Uint8Array</code>
<p>Append signature for transactions signed by Ledger Hardware Wallet</p>

**Kind**: instance method of [<code>Tx</code>](#Tx)  
**Returns**: <code>Uint8Array</code> - <ul>
<li>Serialized Tx bytes with signature appended</li>
</ul>  

| Param | Type | Description |
| --- | --- | --- |
| txBytes | <code>Uint8Array</code> | <p>Serialized transaction</p> |
| ledgerSignatureResponse | <code>ResponseSign</code> | <p>Serialized signature as returned from Ledger</p> |

<a name="Tx+encodeTxArgs"></a>

### tx.encodeTxArgs(txProps) ⇒ <code>Uint8Array</code>
<p>Helper to encode Tx args given TxProps</p>

**Kind**: instance method of [<code>Tx</code>](#Tx)  
**Returns**: <code>Uint8Array</code> - <p>Serialized TxMsgValue</p>  

| Param | Type | Description |
| --- | --- | --- |
| txProps | <code>TxProps</code> | <p>properties of the transaction</p> |

<a name="EncodedTx"></a>

## EncodedTx
<p>Wrap results of tx building along with TxMsg</p>

**Kind**: global class  

* [EncodedTx](#EncodedTx)
    * [new EncodedTx(txMsg, tx)](#new_EncodedTx_new)
    * [.toBytes()](#EncodedTx+toBytes) ⇒ <code>Uint8Array</code>
    * [.free()](#EncodedTx+free)

<a name="new_EncodedTx_new"></a>

### new EncodedTx(txMsg, tx)
<p>Create an EncodedTx class</p>


| Param | Type | Description |
| --- | --- | --- |
| txMsg | <code>Uint8Array</code> | <p>Borsh-serialized transaction</p> |
| tx | <code>BuiltTx</code> | <p>Specific tx struct instance</p> |

<a name="EncodedTx+toBytes"></a>

### encodedTx.toBytes() ⇒ <code>Uint8Array</code>
<p>Return serialized tx bytes for external signing. This will clear
the BuiltTx struct instance from wasm memory, then return the bytes.</p>

**Kind**: instance method of [<code>EncodedTx</code>](#EncodedTx)  
**Returns**: <code>Uint8Array</code> - <p>Serialized tx bytes</p>  
<a name="EncodedTx+free"></a>

### encodedTx.free()
<p>Clear tx bytes resource</p>

**Kind**: instance method of [<code>EncodedTx</code>](#EncodedTx)  
<a name="SignedTx"></a>

## SignedTx
**Kind**: global class  
<a name="new_SignedTx_new"></a>

### new SignedTx(txMsg, tx)

| Param | Type | Description |
| --- | --- | --- |
| txMsg | <code>Uint8Array</code> | <p>Serialized tx msg bytes</p> |
| tx | <code>Uint8Array</code> | <p>Serialized tx bytes</p> |

<a name="initLedgerUSBTransport"></a>

## initLedgerUSBTransport ⇒ <code>Transport</code>
<p>Initialize HID transport</p>

**Kind**: global variable  
**Returns**: <code>Transport</code> - <p>Transport object</p>  
<a name="EncodedTx"></a>

## EncodedTx
<p>Wrap results of tx signing to simplify passing between Sdk functions</p>

**Kind**: global variable  

* [EncodedTx](#EncodedTx)
    * [new EncodedTx(txMsg, tx)](#new_EncodedTx_new)
    * [.toBytes()](#EncodedTx+toBytes) ⇒ <code>Uint8Array</code>
    * [.free()](#EncodedTx+free)

<a name="new_EncodedTx_new"></a>

### new EncodedTx(txMsg, tx)
<p>Create an EncodedTx class</p>


| Param | Type | Description |
| --- | --- | --- |
| txMsg | <code>Uint8Array</code> | <p>Borsh-serialized transaction</p> |
| tx | <code>BuiltTx</code> | <p>Specific tx struct instance</p> |

<a name="EncodedTx+toBytes"></a>

### encodedTx.toBytes() ⇒ <code>Uint8Array</code>
<p>Return serialized tx bytes for external signing. This will clear
the BuiltTx struct instance from wasm memory, then return the bytes.</p>

**Kind**: instance method of [<code>EncodedTx</code>](#EncodedTx)  
**Returns**: <code>Uint8Array</code> - <p>Serialized tx bytes</p>  
<a name="EncodedTx+free"></a>

### encodedTx.free()
<p>Clear tx bytes resource</p>

**Kind**: instance method of [<code>EncodedTx</code>](#EncodedTx)  
<a name="initAsync"></a>

## initAsync(url, [token]) ⇒ [<code>Sdk</code>](#Sdk)
<p>Returns an initialized Sdk class asynchronously. This is required to use
this library in web applications.</p>

**Kind**: global function  
**Returns**: [<code>Sdk</code>](#Sdk) - <p>Instance of initialized Sdk class</p>  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | <p>RPC url for use with SDK</p> |
| [token] | <code>string</code> | <p>Native token of the target chain, if not provided, an attempt to query it will be made</p> |

<a name="initSync"></a>

## initSync(url, nativeToken) ⇒ [<code>Sdk</code>](#Sdk)
<p>Initialize SDK for Node JS environments</p>

**Kind**: global function  
**Returns**: [<code>Sdk</code>](#Sdk) - <p>SDK instance</p>  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | <p>URL of the node</p> |
| nativeToken | <code>string</code> | <p>Address of the native token</p> |

<a name="initLedgerUSBTransport"></a>

## initLedgerUSBTransport() ⇒ <code>Transport</code>
<p>Initialize USB transport</p>

**Kind**: global function  
**Returns**: <code>Transport</code> - <p>Transport object</p>  
