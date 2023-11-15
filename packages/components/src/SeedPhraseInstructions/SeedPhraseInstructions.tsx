import {
  InstructionPanel,
  WarningSummary,
  WarningTip,
} from "./SeedPhraseInstructions.components";

const SeedPhraseInstructions = (): JSX.Element => {
  return (
    <InstructionPanel>
      <WarningTip>
        <WarningSummary>
          DO NOT share your seed phrase with ANYONE
        </WarningSummary>
        Anyone with your seed phrase can have full control over your assets.
        Stay vigilant against phising attacks at all times.
      </WarningTip>

      <WarningTip>
        <WarningSummary>Back up the phrase safely</WarningSummary>
        You will never be able to restore your account without your recovery
        phrase.
      </WarningTip>
    </InstructionPanel>
  );
};

export default SeedPhraseInstructions;
