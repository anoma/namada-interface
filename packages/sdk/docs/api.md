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
<a name="Ledger+getAddressAndPublicKey"></a>

### ledger.getAddressAndPublicKey([path]) ⇒ <code>AddressAndPublicKey</code>
<p>Get address and public key associated with optional path, otherwise, use default path
Throw exception if app is not initialized.</p>

**Kind**: instance method of [<code>Ledger</code>](#Ledger)  

| Param | Type | Description |
| --- | --- | --- |
| [path] | <code>string</code> | <p>Bip44 path for deriving key</p> |

<a name="Ledger+showAddressAndPublicKey"></a>

### ledger.showAddressAndPublicKey([path]) ⇒ <code>AddressAndPublicKey</code>
<p>Prompt user to get address and public key associated with optional path, otherwise, use default path.
Throw exception if app is not initialized.</p>

**Kind**: instance method of [<code>Ledger</code>](#Ledger)  

| Param | Type | Description |
| --- | --- | --- |
| [path] | <code>string</code> | <p>Bip44 path for deriving key</p> |

<a name="Ledger+sign"></a>

### ledger.sign(tx, [path]) ⇒ <code>ResponseSign</code>
<p>Sign tx bytes with the key associated with the provided (or default) path.
Throw exception if app is not initialized.</p>

**Kind**: instance method of [<code>Ledger</code>](#Ledger)  

| Param | Type | Description |
| --- | --- | --- |
| tx | <code>Uint8Array</code> | <p>tx data blob to sign</p> |
| [path] | <code>string</code> | <p>Bip44 path for signing account</p> |

<a name="Ledger+queryErrors"></a>

### ledger.queryErrors() ⇒ <code>string</code>
<p>Query status to determine if device has thrown an error.
Throw exception if app is not initialized.</p>

**Kind**: instance method of [<code>Ledger</code>](#Ledger)  
<a name="Ledger+closeTransport"></a>

### ledger.closeTransport() ⇒ <code>void</code>
<p>Close the initialized transport, which may be needed if Ledger needs to be reinitialized due to error state
Throw exception if app is not initialized.</p>

**Kind**: instance method of [<code>Ledger</code>](#Ledger)  
<a name="Ledger.init"></a>

### Ledger.init([transport]) ⇒ [<code>Ledger</code>](#Ledger)
<p>Initialize and return Ledger class instance with initialized Transport</p>

**Kind**: static method of [<code>Ledger</code>](#Ledger)  

| Param | Type | Description |
| --- | --- | --- |
| [transport] | <code>Transport</code> | <p>Ledger transport</p> |

<a name="Masp"></a>

## Masp
<p>Class representing utilities related to MASP</p>

**Kind**: global class  

* [Masp](#Masp)
    * [new Masp(sdk)](#new_Masp_new)
    * [.hasMaspParams()](#Masp+hasMaspParams) ⇒ <code>boolean</code>
    * [.fetchAndStoreMaspParams()](#Masp+fetchAndStoreMaspParams) ⇒ <code>void</code>
    * [.loadMaspParams()](#Masp+loadMaspParams) ⇒ <code>void</code>
    * [.addSpendingKey(xsk, alias)](#Masp+addSpendingKey)

<a name="new_Masp_new"></a>

### new Masp(sdk)

| Param | Type | Description |
| --- | --- | --- |
| sdk | <code>SdkWasm</code> | <p>Instance of Sdk struct from wasm lib</p> |

<a name="Masp+hasMaspParams"></a>

### masp.hasMaspParams() ⇒ <code>boolean</code>
<p>Check if SDK has MASP parameters loaded</p>

**Kind**: instance method of [<code>Masp</code>](#Masp)  
<a name="Masp+fetchAndStoreMaspParams"></a>

### masp.fetchAndStoreMaspParams() ⇒ <code>void</code>
<p>Fetch MASP parameters and store them in SDK</p>

**Kind**: instance method of [<code>Masp</code>](#Masp)  
<a name="Masp+loadMaspParams"></a>

### masp.loadMaspParams() ⇒ <code>void</code>
<p>Load stored MASP params</p>

**Kind**: instance method of [<code>Masp</code>](#Masp)  
<a name="Masp+addSpendingKey"></a>

### masp.addSpendingKey(xsk, alias)
<p>Add spending key to SDK wallet</p>

**Kind**: instance method of [<code>Masp</code>](#Masp)  

| Param | Type |
| --- | --- |
| xsk | <code>string</code> | 
| alias | <code>string</code> | 

<a name="Mnemonic"></a>

## Mnemonic
<p>Class for accessing mnemonic functionality from wasm</p>

**Kind**: global class  

* [Mnemonic](#Mnemonic)
    * [new Mnemonic(cryptoMemory)](#new_Mnemonic_new)
    * [.generate([size])](#Mnemonic+generate) ⇒ <code>Array.&lt;string&gt;</code>
    * [.toSeed(phrase, [passphrase])](#Mnemonic+toSeed) ⇒ <code>Uint8Array</code>
    * [.validateMnemonic(phrase)](#Mnemonic+validateMnemonic) ⇒ <code>void</code>

<a name="new_Mnemonic_new"></a>

### new Mnemonic(cryptoMemory)

| Param | Type | Description |
| --- | --- | --- |
| cryptoMemory | <code>WebAssembly.Memory</code> | <p>Memory accessor for crypto lib</p> |

<a name="Mnemonic+generate"></a>

### mnemonic.generate([size]) ⇒ <code>Array.&lt;string&gt;</code>
<p>Generate a new 12 or 24 word mnemonic</p>

**Kind**: instance method of [<code>Mnemonic</code>](#Mnemonic)  
**Returns**: <code>Array.&lt;string&gt;</code> - <p>array of words</p>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [size] | <code>PhraseSize</code> | <code>12</code> | <p>Mnemonic length</p> |

<a name="Mnemonic+toSeed"></a>

### mnemonic.toSeed(phrase, [passphrase]) ⇒ <code>Uint8Array</code>
<p>Convert mnemonic to seed bytes</p>

**Kind**: instance method of [<code>Mnemonic</code>](#Mnemonic)  

| Param | Type | Description |
| --- | --- | --- |
| phrase | <code>string</code> |  |
| [passphrase] | <code>string</code> | <p>Bip39 passphrase</p> |

<a name="Mnemonic+validateMnemonic"></a>

### mnemonic.validateMnemonic(phrase) ⇒ <code>void</code>
<p>Validate a mnemonic string, raise an exception providing reason
for failure if invalid, otherwise return nothing</p>

**Kind**: instance method of [<code>Mnemonic</code>](#Mnemonic)  

| Param | Type |
| --- | --- |
| phrase | <code>string</code> | 

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
        * [.signing](#Sdk+signing) ⇒ [<code>Signi