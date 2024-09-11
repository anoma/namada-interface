import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { MyValidatorsFilter } from "App/Staking/MyValidatorsFilter";
import { ValidatorFilterOptions } from "types";

describe("Component: MyValidatorsFilter", () => {
  const mockOnChangeFilter = jest.fn();
  const toggleValidatorCallback = jest.fn();

  const setup = (
    filter: ValidatorFilterOptions = "all",
    myValidatorsOnly: boolean = false
  ): void => {
    render(
      <MyValidatorsFilter
        onChangeFilter={mockOnChangeFilter}
        filter={filter}
        myValidatorsFilterActive={myValidatorsOnly}
        onToggleMyValidatorsFilterActive={toggleValidatorCallback}
      />
    );
  };

  const getMyValidatorButton = (): HTMLElement =>
    screen.getByRole("button", { name: /your validators/i });

  test("renders the component with the select box and my validators button", () => {
    setup();

    // Check if the select box is rendered
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();

    // Check if the button is rendered
    const button = getMyValidatorButton();
    expect(button).toBeInTheDocument();
  });

  test("renders with the correct default values", () => {
    setup();
    const element = screen.getByLabelText("All");
    expect(element).toBeInTheDocument();
    expect(element).toBeChecked();
  });

  test("calls onChange when the action button is clicked", () => {
    setup("all", false);
    const button = getMyValidatorButton();
    fireEvent.click(button);
    expect(toggleValidatorCallback).toHaveBeenCalledWith(true);
  });

  test("updates the filter state when a different option is selected", () => {
    setup("all");
    const element = screen.getByLabelText("Jailed");
    fireEvent.click(element);
    expect(mockOnChangeFilter).toHaveBeenCalledWith("jailed");
  });

  test("displays the my-validators button selected", () => {
    setup("all", true);
    const element = getMyValidatorButton();
    expect(element).toHaveAttribute("aria-selected", "true");
  });
});
