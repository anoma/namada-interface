import { Input } from "@namada/components";
import clsx from "clsx";

type SeedPhraseListItemProps = {
  idx: number;
  word: string;
  onChange?: (index: number, value: string) => void;
  onPaste?: (idx: number, e: React.ClipboardEvent<HTMLInputElement>) => void;
};

export const SeedPhraseListItem = ({
  idx,
  word,
  onChange,
  onPaste,
}: SeedPhraseListItemProps): JSX.Element => {
  return (
    <li
      className={clsx(
        "relative bg-black rounded-sm text-neutral-500 text-base font-light",
        "list-inside list-decimal px-2.5 py-4"
      )}
    >
      {onChange ? (
        <span
          className={clsx(
            "absolute left-0 -top-2 w-full h-full",
            "[&_input]:bg-transparent [&_input]:pt-4 [&_input]:pb-4 [&_input]:pl-10"
          )}
        >
          <Input
            label=""
            variant="PasswordOnBlur"
            hideIcon={true}
            onChange={(e) => onChange(idx, e.target.value)}
            onPaste={(e) => onPaste && onPaste(idx, e)}
            value={word}
          />
        </span>
      ) : (
        <span
          className={clsx(
            "absolute text-white font-bold left-12 top-[1em] select-none"
          )}
        >
          {word}
        </span>
      )}
    </li>
  );
};
