import { ActionButton, ActionButtonProps, Stack } from "@namada/components";

type FilterOptions = "all" | "my-validators";

type MyValidatorsFilterProps = {
  onChange: (type: FilterOptions) => void;
  value: FilterOptions;
};

export const MyValidatorsFilter = ({
  onChange,
  value,
}: MyValidatorsFilterProps): JSX.Element => {
  const getButtonProps = (selected: boolean): ActionButtonProps<"button"> => {
    return {
      size: "sm",
      type: "button",
      borderRadius: "sm",
      outlineColor: "white",
      backgroundColor: selected ? "white" : "transparent",
      backgroundHoverColor: "white",
      textColor: selected ? "black" : "white",
      textHoverColor: "black",
    };
  };

  return (
    <Stack gap={1.5} direction="horizontal" as="ul">
      <li>
        <ActionButton
          {...getButtonProps(value === "all")}
          onClick={() => onChange("all")}
        >
          All
        </ActionButton>
      </li>
      <li>
        <ActionButton
          {...getButtonProps(value === "my-validators")}
          onClick={() => onChange("my-validators")}
        >
          Your Validators
        </ActionButton>
      </li>
    </Stack>
  );
};
