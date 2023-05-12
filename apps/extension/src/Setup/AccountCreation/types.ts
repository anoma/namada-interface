export enum AccountCreationRoute {
  // phrase is provided to the user
  SeedPhrase = "seed-phrase",
  // user confirms the saving of the phrase
  SeedPhraseConfirmation = "seed-phrase-confirmation",
  // user sets a password for a wallet
  Password = "password",
  // the last screen to confirm the completion of the flow
  Completion = "completion",
}

export const accountCreationSteps = [
  AccountCreationRoute.SeedPhrase,
  AccountCreationRoute.SeedPhraseConfirmation,
  AccountCreationRoute.Password,
  AccountCreationRoute.Completion,
];

export type Step = {
  title: string;
  url: string;
  next?: Step;
  previous?: Step;
};

export type AccountDetails = {
  alias: string;
  password?: string;
};
