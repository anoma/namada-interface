import { ContentMasker } from "@namada/components";
import { SeedList, SeedListItem, Word } from "./SeedPhraseList.components";

type SeedPhraseListProps = {
  words: string[];
};

export const SeedPhraseList = ({ words }: SeedPhraseListProps): JSX.Element => {
  return (
    <ContentMasker>
      <SeedList columns={3}>
        {words.map((word, idx) => (
          <SeedListItem key={`seed-phrase-list-${idx}`}>
            <Word>{word}</Word>
          </SeedListItem>
        ))}
      </SeedList>
    </ContentMasker>
  );
};
