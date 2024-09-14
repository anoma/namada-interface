import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { SelectedChain } from "App/Transfer/SelectedChain";
import { Chain } from "types";

describe("Component: SelectedChain", () => {
  const mockChain: Chain = {
    chainId: "chain-id",
    name: "Ethereum",
    iconUrl: "https://example.com/ethereum-icon.png",
  };

  it("renders correctly with no chain selected", () => {
    render(<SelectedChain />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button.getAttribute("aria-description")).toMatch(/no chain/i);
  });

  it("renders correctly with chain selected", () => {
    render(<SelectedChain chain={mockChain} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button.getAttribute("aria-description")).toContain(mockChain.name);

    const chainName = screen.getByText(mockChain.name);
    expect(chainName).toBeInTheDocument();

    const chainImage = screen.getByAltText(`${mockChain.name}`, {
      exact: false,
    });
    expect(chainImage).toBeInTheDocument();
    expect(chainImage).toHaveAttribute(
      "style",
      `background-image: url(${mockChain.iconUrl});`
    );
  });

  it("calls onClick when the component is clicked", () => {
    const handleClick = jest.fn();
    render(<SelectedChain onClick={handleClick} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
