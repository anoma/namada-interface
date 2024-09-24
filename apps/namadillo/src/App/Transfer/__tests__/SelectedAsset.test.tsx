import { Chain } from "@chain-registry/types";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { SelectedAsset } from "App/Transfer/SelectedAsset"; // Adjust the path accordingly
import { Asset } from "types"; // Adjust the path accordingly
import { randomChainMock } from "../__mocks__/chains";

describe("SelectedAsset", () => {
  const mockAsset: Partial<Asset> = {
    name: "Ethereum",
    denomination: "ETH",
    iconUrl: "https://example.com/eth-icon.png",
  };

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
        asset={mockAsset as Asset}
        onClick={handleClick}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeEnabled();

    const assetDenomination = screen.getByText(mockAsset.denomination!);
    expect(assetDenomination).toBeInTheDocument();

    const assetImage = screen.getByAltText(`${mockAsset.name} image`);
    expect(assetImage).toHaveStyle(
      `background-image: url(${mockAsset.iconUrl})`
    );

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
