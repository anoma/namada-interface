import {
  InstructionPanel,
  WarningSummary,
  WarningText,
  WarningTip,
} from "./SeedPhraseInstructions.components";

const SeedPhraseInstructions = (): JSX.Element => {
  return (
    <InstructionPanel>
      <WarningTip>
        <WarningSummary>
          DO NOT share your seed phrase with ANYONE
        </WarningSummary>
        <WarningText>
          Anyone with your seed phrase can have full control over your assets.
          Stay vigilant against phishing attacks at all times.
        </WarningText>
      </WarningTip>

      <WarningTip>
        <WarningSummary>Back up the phrase safely</WarningSummary>
        <WarningText>
          You will never be able to restore your account without your seed
          phrase.
        </WarningText>
      </WarningTip>
    </InstructionPanel>
  );
};

export default SeedPhraseInstructions;
