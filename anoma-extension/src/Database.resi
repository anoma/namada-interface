type id = int

type keyStorageState =
  | Empty
  | NonEmpty

type namedKeypair = {
  name: string,
  keypair: Anoma.Keypair.t,
}

type unknownException = [#unknownException(option<string>)]

let openDb: unit => Promise.t<Dexie.Database.t>

let getEncryptionKey: (
  ~db: Dexie.Database.t,
  ~password: string,
) => Promise.t<result<Passworder.storedCryptoKey, [> Passworder.error | #keyNotFound]>>

let createEncryptionKey: (
  ~db: Dexie.Database.t,
  ~password: string,
) => Promise.t<result<Passworder.cryptoKey, [> #keyAlreadyExists | unknownException]>>

let updateEncryptionKey: (
  ~db: Dexie.Database.t,
  ~previousPassword: string,
  ~password: string,
) => Promise.t<result<unit, [> Passworder.error | #keyNotFound]>>

let getMnemonicPhrase: (
  ~db: Dexie.Database.t,
  ~key: Passworder.cryptoKey,
) => Promise.t<result<Anoma.Keypair.mnemonicPhrase, [> #phraseNotFound | unknownException]>>

let insertMnemonicPhrase: (
  ~db: Dexie.Database.t,
  ~mnemonicPhrase: Anoma.Keypair.mnemonicPhrase,
  ~key: Passworder.cryptoKey,
) => Promise.t<result<unit, [> #phraseAlreadyExists | unknownException]>>

let getKeyStorageState: Dexie.Database.t => Promise.t<keyStorageState>

let insertKey: (
  ~db: Dexie.Database.t,
  ~key: Passworder.cryptoKey,
  ~anomaKeypair: Anoma.Keypair.t,
  ~name: string,
) => Promise.t<result<id, [> unknownException]>>

let listKeys: (
  ~db: Dexie.Database.t,
  ~key: Passworder.cryptoKey,
) => Promise.t<result<array<namedKeypair>, [> Passworder.error | unknownException]>>

let initDb: (
  ~db: Dexie.Database.t,
  ~mnemonicPhrase: Anoma.Keypair.mnemonicPhrase,
  ~password: string,
  ~name: string,
) => Promise.t<
  result<
    id,
    [>
      | #keyAlreadyExists
      | #phraseAlreadyExists
      | unknownException
    ],
  >,
>
