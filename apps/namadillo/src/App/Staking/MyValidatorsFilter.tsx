import { ActionButton, Stack } from "@namada/components";
import clsx from "clsx";

type FilterOptions = "all" | "my-validators";

type MyValidatorsFilterProps = {
  onChange: (type: FilterOptions) => void;
  value: FilterOptions;
};

export const MyValidatorsFilter = ({
  onChange,
  value,
}: MyValidatorsFilterProps): JSX.Element => {
  const selectedClassList = "[&_i]:!bg-white !text-black";
  return (
    <Stack gap={1.5} direction="horizontal" as="ul">
      <li>
        <ActionButton
          type="button"
          color="white"
          size="sm"
          borderRadius="sm"
          outlined={value !== "all"}
          className={clsx({ [selectedClassList]: value === "all" })}
          onClick={() => onChange("all")}
        >
          All
        </ActionButton>
      </li>
      <li>
        <ActionButton
          className={clsx({ [selectedClassList]: value === "my-validators" })}
          type="button"
          color="white"
          size="sm"
          borderRadius="sm"
          outlined={value !== "my-validators"}
          onClick={() => onChange("my-validators")}
        >
          Your Validators
        </ActionButton>
      </li>
    </Stack>
  );
};
