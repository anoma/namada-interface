import { Stack } from "@namada/components";
import MyValidatorsFilter from "./MyValidatorsFilter";
import { ValidatorSearch } from "./ValidatorSearch";

type Props = {
  onChangeSearch: (searchStr: string) => void;
  onFilterByMyValidators: (showMyValidators: boolean) => void;
  onlyMyValidators: boolean;
};

export const ValidatorFilterNav = ({
  onChangeSearch,
  onFilterByMyValidators,
  onlyMyValidators,
}: Props): JSX.Element => {
  return (
    <Stack direction="horizontal" gap={2} className="w-[60%] items-center mb-2">
      <ValidatorSearch onChange={(value: string) => onChangeSearch(value)} />
      <MyValidatorsFilter
        value={onlyMyValidators ? "my-validators" : "all"}
        onChange={(filter: string) =>
          onFilterByMyValidators(filter === "my-validators")
        }
      />
    </Stack>
  );
};
