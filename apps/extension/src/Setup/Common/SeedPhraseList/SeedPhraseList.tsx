import { ContentMasker, Input } from "@namada/components";
import {
  SeedList,
  SeedListItem,
  Word,
  WordInput,
} from "./SeedPhraseList.components";

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
    <SeedList data-testid="setup-seed-phrase-list" columns={columns}>
      {words.map((word, idx) => (
        <SeedListItem key={`seed-phrase-list-${idx}`}>
          {onChange ? (
            <WordInput>
              <Input
                label=""
                variant="PasswordOnBlur"
                hideIcon={true}
                onChange={(e) => onChange(idx, e.target.value)}
                onPaste={(e) => onPaste && onPaste(idx, e)}
                value={word}
              />
            </WordInput>
          ) : (
            <Word>{word}</Word>
          )}
        </SeedListItem>
      ))}
    </SeedList>
  );

  if (sensitive) {
    return <ContentMasker>{list}</ContentMasker>;
  }

  return list;
};
