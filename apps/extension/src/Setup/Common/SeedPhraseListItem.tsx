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
        "relative bg-black rounded-sm text-neutral-500 text-sm font-light",
        "px-1 py-3 h-[48px]"
      )}
    >
      {onChange ? (
        <span
          className={clsx(
            "flex items-center absolute left-0 top-0 w-full h-full",
            "[&_input]:bg-transparent [&_input]:border-0",
            "[&_input]:pt-4 [&_input]:pb-3 [&_input]:pl-7"
          )}
        >
          <i className="absolute left-2 not-italic pointer-events-none">
            {idx + 1}
          </i>
          <Input
            label=""
            className="-mt-2"
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
            "absolute text-white font-light left-2.5 top-[1em] select-none"
          )}
        >
          {idx + 1} <span className="font-bold">{word}</span>
        </span>
      )}
    </li>
  );
};
