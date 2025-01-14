import { Asset } from "@chain-registry/types";
import { fireEvent, render, screen } from "@testing-library/react";
import { assetMock } from "App/Transfer/__mocks__/assets";
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
        availableAmountMinusFees={new BigNumber(1234.456)}
        asset={assetMock as Asset}
        onClickMax={callback}
      />
    );
    const amount = screen.getByText("1,234");
    const button = screen.getByRole("button");
    expect(amount.parentNode?.textContent).toContain("1,234.456 ETH");
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should not display MAX button when no callback was provided", () => {
    render(
      <AvailableAmountFooter
        availableAmountMinusFees={new BigNumber(100)}
        asset={assetMock as Asset}
      />
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should display the balance and the disabled button when the amount is zero", () => {
    const callback = jest.fn();
    render(
      <AvailableAmountFooter
        availableAmount={new BigNumber(1)}
        availableAmountMinusFees={new BigNumber(0)}
        asset={assetMock as Asset}
        onClickMax={callback}
      />
    );
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(callback).not.toHaveBeenCalled();
    const warning = screen.getByText("Insufficient balance to cover the fee");
    expect(warning).toBeVisible();
    const balance = screen.getByText("1 ETH");
    expect(balance).toBeVisible();
  });
});
