export enum AccountCreationRoute {
  // initial screen to explain the flow
  Start = "start",
  // user is requested to enter account alias and password
  //AccountDetails = "account-details",
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
  AccountCreationRoute.Start,
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

export type AccountCreationDetails = {
  alias?: string;
  password?: string;
};
