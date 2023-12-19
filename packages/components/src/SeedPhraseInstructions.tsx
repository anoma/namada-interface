export const SeedPhraseInstructions = (): JSX.Element => {
  return (
    <article className="bg-[#212121] rounded-md px-[2.25em] py-[1.75em] text-white">
      <p className="mb-5">
        <strong className="block mb-0.5 text-yellow">
          DO NOT share your seed phrase with ANYONE
        </strong>
        <span className="block text-[0.95em] leading-5">
          Anyone with your seed phrase can have full control over your assets.
          Stay vigilant against phishing attacks at all times.
        </span>
      </p>
      <p className="">
        <strong className="block mb-0.5 text-yellow">
          Back up the phrase safely
        </strong>
        <span className="block text-[0.95em] leading-5">
          You will never be able to restore your account without your seed
          phrase.
        </span>
      </p>
    </article>
  );
};
