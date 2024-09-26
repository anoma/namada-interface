import { Asset, Chain } from "@chain-registry/types";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { SelectedAsset } from "App/Transfer/SelectedAsset"; // Adjust the path accordingly
import { assetMock } from "../__mocks__/assets";
import { randomChainMock } from "../__mocks__/chains";

describe("SelectedAsset", () => {
  it("renders with no chain and disables the button", () => {
    render(<SelectedAsset />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("renders with no asset selected", () => {
    const mockFn = jest.fn();
    render(<SelectedAsset chain={randomChainMock as Chain} onClick={mockFn} />);

    const button = screen.getByRole("button");
    expect(button).toBeEnabled();

    const assetLabel = screen.getByText(/asset/i);
    expect(assetLabel).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("renders with asset selected", () => {
    const handleClick = jest.fn();
    render(
      <SelectedAsset
        chain={randomChainMock as Chain}
        asset={assetMock as Asset}
        onClick={handleClick}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeEnabled();

    const assetDenomination = screen.getByText(assetMock.symbol!);
    expect(assetDenomination).toBeInTheDocument();

    const assetImage = screen.getByAltText(`${assetMock.name} image`);
    expect(assetImage).toHaveAttribute("src", assetMock.logo_URIs?.svg);

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when the button is disabled", () => {
    const handleClick = jest.fn();
    render(<SelectedAsset onClick={handleClick} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
