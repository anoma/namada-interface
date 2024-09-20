import { fireEvent, render, screen } from "@testing-library/react";
import BigNumber from "bignumber.js";
import { AvailableAmountFooter } from "../AvailableAmountFooter";

describe("Component: AvailableAmountFooter", () => {
  it("should render an empty tag when no available amount is provided", () => {
    const { container } = render(<AvailableAmountFooter />);
    expect(container).toBeEmptyDOMElement();
  });

  it("should render with correct information and behaviour enabled", () => {
    const callback = jest.fn();
    render(
      <AvailableAmountFooter
        currency="nam"
        availableAmount={new BigNumber(1234.456)}
        onClickMax={callback}
      />
    );
    const amount = screen.getByText("1,234");
    const button = screen.getByRole("button");
    expect(amount.parentNode?.textContent).toContain("1,234.456 NAM");
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should not display MAX button when no callback was provided", () => {
    render(
      <AvailableAmountFooter
        availableAmount={new BigNumber(100)}
        currency="nam"
      />
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should display disabled button when the amount is zero", () => {
    const callback = jest.fn();
    render(
      <AvailableAmountFooter
        availableAmount={new BigNumber(0)}
        currency="nam"
        onClickMax={callback}
      />
    );
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(callback).not.toHaveBeenCalled();
  });
});
