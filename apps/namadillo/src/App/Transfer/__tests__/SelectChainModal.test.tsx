import { Chains } from "@chain-registry/types";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  namadaChainMock,
  randomChainMock,
} from "App/Transfer/__mocks__/chains";
import { SelectChainModal } from "App/Transfer/SelectChainModal";

describe("Component: SelectChainModal", () => {
  const mockChains = [randomChainMock, namadaChainMock];

  it("should render component and list of chains correctly", () => {
    render(
      <SelectChainModal
        chains={mockChains as Chains}
        onClose={jest.fn()}
        onSelect={jest.fn()}
      />
    );
    expect(screen.getByText("Namada")).toBeInTheDocument();
    expect(screen.getByText("TestChain")).toBeInTheDocument();
    //
    // Check for modal title
    expect(screen.getByText("Select Source Chain")).toBeInTheDocument();

    // Check if all chains are rendered
    mockChains.forEach((chain) => {
      expect(screen.getByText(chain.pretty_name!)).toBeInTheDocument();
      expect(
        screen.getByAltText(`${chain.pretty_name} logo`)
      ).toBeInTheDocument();
    });
  });

  it("should select the correct chain on click", () => {
    const handleSelect = jest.fn();
    render(
      <SelectChainModal
        onClose={jest.fn()}
        onSelect={handleSelect}
        chains={mockChains as Chains}
      />
    );
    fireEvent.click(screen.getByText(mockChains[0].pretty_name!));
    expect(handleSelect).toHaveBeenCalledWith(mockChains[0]);
  });
});
