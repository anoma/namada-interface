[@namada/types](../README.md) / [Exports](../modules.md) / BroadcastTxError

# Class: BroadcastTxError

Custom error for Broadcast Tx

## Hierarchy

- `Error`

  ↳ **`BroadcastTxError`**

## Table of contents

### Constructors

- [constructor](BroadcastTxError.md#constructor)

### Properties

- [cause](BroadcastTxError.md#cause)
- [message](BroadcastTxError.md#message)
- [name](BroadcastTxError.md#name)
- [stack](BroadcastTxError.md#stack)
- [prepareStackTrace](BroadcastTxError.md#preparestacktrace)
- [stackTraceLimit](BroadcastTxError.md#stacktracelimit)

### Methods

- [toProps](BroadcastTxError.md#toprops)
- [toString](BroadcastTxError.md#tostring)
- [captureStackTrace](BroadcastTxError.md#capturestacktrace)

## Constructors

### constructor

• **new BroadcastTxError**(`message`): [`BroadcastTxError`](BroadcastTxError.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | string |

#### Returns

[`BroadcastTxError`](BroadcastTxError.md)

BroadcastTxError

#### Overrides

Error.constructor

#### Defined in

[packages/types/src/errors.ts:11](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/errors.ts#L11)

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

Error.cause

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:24

___

### message

• **message**: `string`

#### Inherited from

Error.message

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1077

___

### name

• **name**: `string`

#### Inherited from

Error.name

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1076

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

Error.stack

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1078

___

### prepareStackTrace

▪ `Static` `Optional` **prepareStackTrace**: (`err`: `Error`, `stackTraces`: `CallSite`[]) => `any`

Optional override for formatting stack traces

**`See`**

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Type declaration

▸ (`err`, `stackTraces`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `err` | `Error` |
| `stackTraces` | `CallSite`[] |

##### Returns

`any`

#### Inherited from

Error.prepareStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:143

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

Error.stackTraceLimit

#### Defined in

node_modules/@types/node/globals.d.ts:145

## Methods

### toProps

▸ **toProps**(): [`TxResponseMsgValue`](TxResponseMsgValue.md)

#### Returns

[`TxResponseMsgValue`](TxResponseMsgValue.md)

TxResponseProps

#### Defined in

[packages/types/src/errors.ts:35](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/errors.ts#L35)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

string

#### Defined in

[packages/types/src/errors.ts:19](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/errors.ts#L19)

___

### captureStackTrace

▸ **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Create .stack property on a target object

#### Parameters

| Name | Type |
| :------ | :------ |
| `targetObject` | `object` |
| `constructorOpt?` | `Function` |

#### Returns

`void`

#### Inherited from

Error.captureStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:136
