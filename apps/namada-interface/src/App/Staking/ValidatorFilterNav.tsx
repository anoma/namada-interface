import { ActionButton, Stack } from "@namada/components";
import MyValidatorsFilter from "./MyValidatorsFilter";
import { ValidatorSearch } from "./ValidatorSearch";

type Props = {
  onChangeSearch: (searchStr: string) => void;
  onFilterByMyValidators: (showMyValidators: boolean) => void;
  onRandomize?: () => void;
  onlyMyValidators: boolean;
};

export const ValidatorFilterNav = ({
  onChangeSearch,
  onFilterByMyValidators,
  onRandomize,
  onlyMyValidators,
}: Props): JSX.Element => {
  return (
    <Stack direction="horizontal" gap={2} className="w-full items-center mb-2">
      <div className="w-[60%]">
        <ValidatorSearch onChange={(value: string) => onChangeSearch(value)} />
      </div>
      <MyValidatorsFilter
        value={onlyMyValidators ? "my-validators" : "all"}
        onChange={(filter: string) =>
          onFilterByMyValidators(filter === "my-validators")
        }
      />
      {onRandomize && (
        <ActionButton
          type="button"
          onClick={onRandomize}
          color="white"
          className="ml-auto w-auto px-8"
          size="sm"
          borderRadius="sm"
        >
          Randomise
        </ActionButton>
      )}
    </Stack>
  );
};
