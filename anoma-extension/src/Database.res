type id = int

let schema = [("keypairs", "++id,name"), ("encryptionKey", "id"), ("mnemonicPhrase", "id")]

let openDb = () => {
  let dexie = Dexie.Database.make("DB opened")

  Dexie.Database.version(dexie, 1)->Dexie.Version.stores(schema)->ignore

  Dexie.Database.opendb(dexie)->Promise.thenResolve(_ => dexie)
}

type unknownException = [#unknownException(option<string>)]

let catchUnknownExceptions = promise =>
  Promise.catch(promise, exn => {
    switch exn {
    | Js.Exn.Error(obj) => Error(#unknownException(Js.Exn.message(obj)))
    | _ => Error(#unknownException(None))
    }->Promise.resolve
  })

// We use a stored cryptoKey to make password changing easy.
// This means that we'll never change the key used for encrypting
// the keypairs, but we'll encrypt this key using a password-based encryption.
// When the password is changed, we just need to change the password
// used in the encryption of the key.
module EncryptionKeySchema = {
  open Passworder

  type id = id
  type t = {
    id: option<int>,
    key: serializedEncryptionResult<storedCryptoKey>,
  }
  let tableName = "encryptionKey"
}

module EncryptionKey = Dexie.Table.MakeTable(EncryptionKeySchema)

let getEncryptionKey = (~db, ~password) => {
  db
  ->EncryptionKey.getById(1)
  ->Promise.thenResolve(Utils.Result.fromOption(_, Error(#keyNotFound)))
  ->Utils.Promise.flatMapOk(({key: encryptedData}) => Passworder.decrypt(~password, ~encryptedData))
}

let createEncryptionKey = (~db, ~password) => {
  db
  ->EncryptionKey.count
  ->Promise.then(count => {
    if count != 0 {
      Promise.resolve(Error(#keyAlreadyExists))
    } else {
      let cryptoKey = Passworder.generateRandomKey()

      Passworder.encrypt(~password, ~data=cryptoKey)
      ->Promise.then(key => {
        EncryptionKey.add(db, {id: Some(1), key: key})
      })
      ->Promise.then(_ => Passworder.keyFromStored(cryptoKey))
      ->Promise.thenResolve(value => Ok(value))
    }
  })
  ->catchUnknownExceptions
}

let updateEncryptionKey = (~db, ~previousPassword, ~password) => {
  getEncryptionKey(~db, ~password=previousPassword)
  ->Utils.Promise.mapOk(data => Passworder.encrypt(~password, ~data))
  ->Utils.Promise.mapOk(key => {
    EncryptionKey.put(db, {id: Some(1), key: key})
  })
  ->Utils.Promise.mapOk(_ => Promise.resolve())
}

module MnemonicPhraseSchema = {
  open Passworder

  type id = id
  type t = {
    id: option<int>,
    phrase: encrypted<Anoma.Keypair.mnemonicPhrase>,
  }

  let tableName = "mnemonicPhrase"
}

module MnemonicPhrase = Dexie.Table.MakeTable(MnemonicPhraseSchema)

let getMnemonicPhrase = (~db, ~key) => {
  db
  ->MnemonicPhrase.getById(1)
  ->Promise.thenResolve(Utils.Result.fromOption(_, Error(#phraseNotFound)))
  ->Utils.Promise.mapOk(({phrase}) => Passworder.decryptWithKey(~key, ~encrypted=phrase))
  ->catchUnknownExceptions
}

let insertMnemonicPhrase = (~db, ~mnemonicPhrase, ~key) => {
  Passworder.encryptWithKey(~key, ~data=mnemonicPhrase)
  ->Promise.then(encryptedMnemonic => {
    MnemonicPhrase.count(db)->Promise.then(count => {
      if count != 0 {
        Promise.resolve(Error(#phraseAlreadyExists))
      } else {
        MnemonicPhrase.add(
          db,
          {id: Some(1), phrase: encryptedMnemonic},
        )->Promise.thenResolve(_ => Ok())
      }
    })
  })
  ->catchUnknownExceptions
}

module KeypairSchema = {
  type id = id
  type t = {
    id: option<int>,
    name: string,
    encryptedKeypair: Passworder.encrypted<Anoma.Keypair.t>,
  }
  let tableName = "keypairs"
}

module Keypair = Dexie.Table.MakeTable(KeypairSchema)

type namedKeypair = {
  name: string,
  keypair: Anoma.Keypair.t,
}

type keyStorageState =
  | Empty
  | NonEmpty

let getKeyStorageState = db => {
  db
  ->Keypair.count
  ->Promise.thenResolve(number => {
    number == 0 ? Empty : NonEmpty
  })
}

let insertKey = (~db, ~key, ~anomaKeypair, ~name) => {
  Passworder.encryptWithKey(~key, ~data=anomaKeypair)
  ->Promise.then(encryptedKeypair => {
    Keypair.add(db, {id: None, encryptedKeypair: encryptedKeypair, name: name})
  })
  ->Utils.Promise.catchAsResult(exn =>
    switch exn {
    | Js.Exn.Error(obj) => Error(#unknownException(Js.Exn.message(obj)))
    | _ => Error(#unknownException(None))
    }->Promise.resolve
  )
}

let listKeys = (~db, ~key) => {
  db
  ->Keypair.toArray
  ->Promise.then(keypairs => {
    keypairs
    ->Array.map(({encryptedKeypair: encrypted, name}) => {
      Passworder.decryptWithKey(~key, ~encrypted)->Promise.thenResolve(keypair => {
        name: name,
        keypair: keypair,
      })
    })
    ->Promise.all
  })
  ->Utils.Promise.catchAsResult(err => {
    switch err {
    | Js.Exn.Error(_) => #wrongPassword
    | _unknownExn => #unknownException(None)
    }
    ->Error
    ->Promise.resolve
  })
}

let initDb = (~db, ~mnemonicPhrase, ~password, ~name) => {
  let anomaKeypair = Anoma.Keypair.fromMnemonic(mnemonicPhrase, 1)->Anoma.Keypair.serialize

  createEncryptionKey(~db, ~password)->Utils.Promise.flatMapOk(key => {
    insertMnemonicPhrase(~db, ~mnemonicPhrase, ~key)->Utils.Promise.flatMapOk(_ => {
      insertKey(~db, ~key, ~anomaKeypair, ~name)
    })
  })
}
