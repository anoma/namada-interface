export enum TopLevelRoute {
  Start = "*",
  AccountCreation = "account-creation",
  Ledger = "ledger",
}

export enum AccountCreationRoute {
  // Generate new seed phrase
  SeedPhrase = "seed-phrase",
  // Validate seed phrase
  SeedPhraseConfirmation = "seed-phrase-confirmation",
  // Secure wallet with a password
  Password = "password",
  // Final screen with confirmation
  Completion = "completion",
}

// Alias and optional password (in the case of Ledger accounts)
export type AccountDetails = {
  alias: string;
  password?: string;
};
