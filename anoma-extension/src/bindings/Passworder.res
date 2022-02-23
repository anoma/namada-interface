type salt = string

type serializedEncryptionResult<'a> = string

type encrypted<'a>

type error = [#wrongPassword]

type cryptoKey

type storedCryptoKey = {
  salt: salt,
  generatedPassword: string,
}

@module("@metamask/browser-passworder")
external generateSalt: unit => salt = "generateSalt"

@module("@metamask/browser-passworder")
external keyFromPassword: (~password: string, ~salt: salt) => Promise.t<cryptoKey> =
  "keyFromPassword"

@module("@metamask/browser-passworder")
external unsafeDecrypt: (
  ~password: string,
  ~encryptedData: serializedEncryptionResult<'a>,
) => Promise.t<'a> = "decrypt"

@module("@metamask/browser-passworder")
external encrypt: (~password: string, ~data: 'a) => Promise.t<serializedEncryptionResult<'a>> =
  "encrypt"

@module("@metamask/browser-passworder")
external decryptWithKey: (~key: cryptoKey, ~encrypted: encrypted<'a>) => Promise.t<'a> =
  "decryptWithKey"

@module("@metamask/browser-passworder")
external encryptWithKey: (~key: cryptoKey, ~data: 'a) => Promise.t<encrypted<'a>> = "encryptWithKey"

let generateRandomKey = () => {
  let generatedPassword = generateSalt()
  let salt = generateSalt()

  {generatedPassword: generatedPassword, salt: salt}
}

let decrypt = (~password: string, ~encryptedData: serializedEncryptionResult<'a>): Promise.t<
  result<'a, [> error]>,
> => {
  unsafeDecrypt(~password, ~encryptedData)
  ->Promise.thenResolve(result => Ok(result))
  ->Promise.catch(_ => Promise.resolve(Error(#wrongPassword)))
}

let keyFromStored = ({generatedPassword, salt}) => {
  keyFromPassword(~password=generatedPassword, ~salt)
}
