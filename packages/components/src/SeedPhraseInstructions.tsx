import { Alert } from "@namada/components";

export const SeedPhraseInstructions = (): JSX.Element => {
  return (
    <Alert className="py-4" type="warning">
      <p className="mb-6">
        <strong className="block mb-1 text-sm text-yellow">
          DO NOT share your seed phrase with ANYONE
        </strong>
        <span className="block text-[13px] font-medium leading-4 text-white">
          Anyone with your seed phrase can have full control over your assets.
          Stay vigilant against phishing attacks at all times.
        </span>
      </p>
      <p className="">
        <strong className="block mb-1 text-sm text-yellow">
          Back up the phrase safely
        </strong>
        <span className="block text-[13px] font-medium leading-4 text-white">
          You will never be able to restore your account without your seed
          phrase.
        </span>
      </p>
    </Alert>
  );
};
