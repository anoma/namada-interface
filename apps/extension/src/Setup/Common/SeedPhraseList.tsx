import { ContentMasker } from "@namada/components";
import { SeedPhraseListItem } from "./SeedPhraseListItem";

import clsx from "clsx";

type SeedPhraseListProps = {
  words: string[];
  sensitive?: boolean;
  columns?: number;
  onChange?: (index: number, value: string) => void;
  onPaste?: (index: number, e: React.ClipboardEvent<HTMLInputElement>) => void;
};

export const SeedPhraseList = ({
  words,
  onChange,
  onPaste,
  columns = 3,
  sensitive = true,
}: SeedPhraseListProps): JSX.Element => {
  const list = (
    <ol
      className={clsx("grid gap-2 min-h-[240px]")}
      style={{ gridTemplateColumns: `repeat(${columns}, 148px)` }}
    >
      {words.map((word, idx) => (
        <SeedPhraseListItem
          key={`seed-phrase-list-${idx}`}
          word={word}
          idx={idx}
          onChange={onChange}
          onPaste={onPaste}
        />
      ))}
    </ol>
  );

  if (sensitive) {
    return <ContentMasker>{list}</ContentMasker>;
  }

  return list;
};
