export enum AccountCreationStep {
  Start = "start",
  AccountDetails = "account-details",
  SeedPhrase = "seed-phrase",
  SeedPhraseConfirmation = "seed-phrase-confirmation",
  Completion = "completion",
}

export const accountCreationSteps = [
  AccountCreationStep.Start,
  AccountCreationStep.AccountDetails,
  AccountCreationStep.SeedPhrase,
  AccountCreationStep.SeedPhraseConfirmation,
  AccountCreationStep.Completion,
];

export type Step = {
  title: string;
  url: string;
  next?: Step;
  previous?: Step;
};
