export enum TopLevelRoute {
  Start = "*",
  AccountCreation = "account-creation",
  ImportAccount = "restore-account",
  Ledger = "ledger",
  LedgerConfirmation = "ledger-confirmation",
}

export enum AccountCreationRoute {
  // Security warning / recommentations
  SeedPhraseWarning = "warning",
  // Generate new seed phrase
  SeedPhrase = "seed-phrase",
  // Validate seed phrase
  SeedPhraseConfirmation = "seed-phrase-confirmation",
  // Final screen with confirmation
  Completion = "completion",
}

export enum AccountImportRoute {
  // Type in/paste a seed phrase
  SeedPhrase = "seed-phrase",
  // Secure wallet with a password
  Password = "password",
  // Final screen with confirmation
  Completion = "completion",
}

export enum LedgerConnectRoute {
  Connect = "connect",
  Import = "confirm",
  Completion = "completion",
}

// Alias and optional password (in the case of Ledger accounts)
export type AccountDetails = {
  alias: string;
  password?: string;
};
