import { cleanup, RenderResult, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NamInputProps } from "App/Common/NamInput";
import { AmountField, AmountFieldProps } from "App/Staking/AmountField";
import BigNumber from "bignumber.js";
import { render } from "test-utils";
import { Validator } from "types";

describe("Component: AmountField", () => {
  const mockValidator: Partial<Validator> = {
    address: "tnam1validator1",
    status: "consensus",
  };

  const defaultProps: NamInputProps = {
    value: new BigNumber("100"),
    onChange: jest.fn(),
  };

  const setup = (props: Partial<AmountFieldProps> = {}): RenderResult => {
    return render(
      <AmountField
        validator={mockValidator as Validator}
        updated={false}
        displayCurrencyIndicator={true}
        {...defaultProps}
        {...props}
      />
    );
  };

  const assertTextfieldInDocument = (): void => {
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  };

  const assertTextFieldNotInDocument = (): void => {
    const input = screen.queryByRole("textbox");
    expect(input).not.toBeInTheDocument();
  };

  test("renders the NamInput with correct initial value", () => {
    setup();
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("100");
  });

  test("displays the currency indicator when displayCurrencyIndicator is true", () => {
    setup();
    const currencyIndicator = screen.getByText("NAM");
    expect(currencyIndicator).toBeInTheDocument();
  });

  test("does not display the currency indicator when displayCurrencyIndicator is false", () => {
    setup({ displayCurrencyIndicator: false });
    const currencyIndicator = screen.queryByText("NAM");
    expect(currencyIndicator).not.toBeInTheDocument();
  });

  test("calls onChange when input value changes", async () => {
    const user = userEvent.setup();
    const onChangeMock = jest.fn();
    setup({ onChange: onChangeMock });
    const input = screen.getByRole("textbox");
    await userEvent.clear(input);
    await user.type(input, "200");
    expect(onChangeMock).toHaveBeenCalled();
    expect(input).toHaveValue("200");
  });

  test("should display a warning if validator is jailed", () => {
    setup({ validator: { ...mockValidator, status: "jailed" } as Validator });
    assertTextFieldNotInDocument();
    const text = screen.getByText(/validator is jailed/i);
    expect(text).toBeInTheDocument();
  });

  test("should display a warning if validator has stake and is jailed", () => {
    setup({
      validator: {
        ...mockValidator,
        status: "jailed",
      } as Validator,
      hasStakedAmounts: true,
    });
    assertTextFieldNotInDocument();
    const text = screen.getByText(/you have stopped receiving rewards/i, {
      exact: false,
    });
    expect(text).toBeInTheDocument();
  });

  test("should display a warning if user is inactive", () => {
    setup({
      validator: {
        ...mockValidator,
        status: "inactive",
      } as Validator,
    });
    assertTextFieldNotInDocument();
    const text = screen.getByText(/validator/i, { exact: false });
    expect(text).toHaveTextContent(/Validator is inactive/i);
  });

  test("should display a warning if the validator has stake and is inactive", () => {
    setup({
      validator: {
        ...mockValidator,
        status: "inactive",
      } as Validator,
      hasStakedAmounts: true,
    });
    assertTextFieldNotInDocument();
    const text = screen.getByText(/validator/i, { exact: false });
    expect(text).toHaveTextContent(
      /Validator is inactive please redelegate your stake/i
    );
  });

  test("should display text field if forceActive is true", () => {
    setup({ forceActive: true });
    assertTextfieldInDocument();
    cleanup();

    setup({
      forceActive: true,
      validator: { ...mockValidator, status: "inactive" } as Validator,
    });
    assertTextfieldInDocument();
    cleanup();

    setup({
      forceActive: true,
      validator: { ...mockValidator, status: "jailed" } as Validator,
    });
    assertTextfieldInDocument();
    cleanup();
  });
});
