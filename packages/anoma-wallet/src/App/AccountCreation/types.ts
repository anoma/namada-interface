export enum AccountCreationRoute {
  // initial screen to explain the flow
  Start = "start",
  // user is requested to enter account alias and password
  AccountDetails = "account-details",
  // phrase is provided to the user
  SeedPhrase = "seed-phrase",
  // user confirms the saving of the phrase
  SeedPhraseConfirmation = "seed-phrase-confirmation",
  // the last screen to confirm the completion of the flow
  Completion = "completion",
}

export const accountCreationSteps = [
  AccountCreationRoute.Start,
  AccountCreationRoute.AccountDetails,
  AccountCreationRoute.SeedPhrase,
  AccountCreationRoute.SeedPhraseConfirmation,
  AccountCreationRoute.Completion,
];

export type Step = {
  title: string;
  url: string;
  next?: Step;
  previous?: Step;
};
