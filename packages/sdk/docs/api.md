## Classes

<dl>
<dt><a href="#Ledger">Ledger</a></dt>
<dd><p>Functionality for interacting with NamadaApp for Ledger Hardware Wallets</p></dd>
<dt><a href="#Masp">Masp</a></dt>
<dd><p>Class representing utilities related to MASP</p></dd>
<dt><a href="#Mnemonic">Mnemonic</a></dt>
<dd><p>Class for accessing mnemonic functionality from wasm</p></dd>
<dt><a href="#Sdk">Sdk</a></dt>
<dd><p>API for interacting with Namada SDK</p></dd>
<dt><a href="#Signing">Signing</a></dt>
<dd><p>Non-Tx signing functions</p></dd>
</dl>

## Members

<dl>
<dt><a href="#initLedgerUSBTransport">initLedgerUSBTransport</a> ⇒ <code>Transport</code></dt>
<dd><p>Initialize HID transport</p></dd>
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

<a name="Sdk"></a>

## Sdk
<p>API for interacting with Namada SDK</p>

**Kind**: global class  

* [Sdk](#Sdk)
    * [new Sdk(sdk, query, cryptoMemory, url, nativeToken)](#new_Sdk_new)
    * _instance_
        * [.rpc](#Sdk+rpc) ⇒ <code>Rpc</code>
        * [.tx](#Sdk+tx) ⇒ <code>Tx</code>
        * [.mnemonic](#Sdk+mnemonic) ⇒ [<code>Mnemonic</code>](#Mnemonic)
        * [.keys](#Sdk+keys) ⇒ <code>Keys</code>
        * [.signing](#Sdk+signing) ⇒ [<code>Signing</code>](#Signing)
        * [.masp](#Sdk+masp) ⇒ [<code>Masp</code>](#Masp)
        * [.getRpc()](#Sdk+getRpc) ⇒ <code>Rpc</code>
        * [.getTx()](#Sdk+getTx) ⇒ <code>Tx</code>
        * [.getMnemonic()](#Sdk+getMnemonic) ⇒ [<code>Mnemonic</code>](#Mnemonic)
        * [.getKeys()](#Sdk+getKeys) ⇒ <code>Keys</code>
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

### sdk.rpc ⇒ <code>Rpc</code>
<p>Define rpc getter to use with destructuring assignment</p>

**Kind**: instance property of [<code>Sdk</code>](#Sdk)  
**Returns**: <code>Rpc</code> - <p>rpc client</p>  
<a name="Sdk+tx"></a>

### sdk.tx ⇒ <code>Tx</code>
<p>Define tx getter to use with destructuring assignment</p>

**Kind**: instance property of [<code>Sdk</code>](#Sdk)  
**Returns**: <code>Tx</code> - <p>tx-related functionality</p>  
<a name="Sdk+mnemonic"></a>

### sdk.mnemonic ⇒ [<code>Mnemonic</code>](#Mnemonic)
<p>Define mnemonic getter to use with destructuring assignment</p>

**Kind**: instance property of [<code>Sdk</code>](#Sdk)  
**Returns**: [<code>Mnemonic</code>](#Mnemonic) - <p>mnemonic-related functionality</p>  
<a name="Sdk+keys"></a>

### sdk.keys ⇒ <code>Keys</code>
<p>Define keys getter to use with destructuring assignment</p>

**Kind**: instance property of [<code>Sdk</code>](#Sdk)  
**Returns**: <code>Keys</code> - <p>key-related functionality</p>  
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

### sdk.getRpc() ⇒ <code>Rpc</code>
<p>Return initialized Rpc class</p>

**Kind**: instance method of [<code>Sdk</code>](#Sdk)  
**Returns**: <code>Rpc</code> - <p>Namada RPC client</p>  
<a name="Sdk+getTx"></a>

### sdk.getTx() ⇒ <code>Tx</code>
<p>Return initialized Tx class</p>

**Kind**: instance method of [<code>Sdk</code>](#Sdk)  
**Returns**: <code>Tx</code> - <p>Tx-related functionality</p>  
<a name="Sdk+getMnemonic"></a>

### sdk.getMnemonic() ⇒ [<code>Mnemonic</code>](#Mnemonic)
<p>Return initialized Mnemonic class</p>

**Kind**: instance method of [<code>Sdk</code>](#Sdk)  
**Returns**: [<code>Mnemonic</code>](#Mnemonic) - <p>mnemonic-related functionality</p>  
<a name="Sdk+getKeys"></a>

### sdk.getKeys() ⇒ <code>Keys</code>
<p>Return initialized Keys class</p>

**Kind**: instance method of [<code>Sdk</code>](#Sdk)  
**Returns**: <code>Keys</code> - <p>key-related functionality</p>  
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

<a name="initLedgerUSBTransport"></a>

## initLedgerUSBTransport ⇒ <code>Transport</code>
<p>Initialize HID transport</p>

**Kind**: global variable  
**Returns**: <code>Transport</code> - <p>Transport object</p>  
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
