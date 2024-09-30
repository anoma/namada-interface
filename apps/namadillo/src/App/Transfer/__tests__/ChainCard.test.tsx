import { Chain } from "@chain-registry/types";
import { render, screen } from "@testing-library/react";
import { ChainCard } from "App/Transfer/ChainCard";
import { randomChainMock } from "../__mocks__/chains";

describe("Component: ChainCard", () => {
  it("renders the chain's name", () => {
    render(<ChainCard chain={randomChainMock as Chain} />);
    expect(screen.getByText(randomChainMock.pretty_name!)).toBeInTheDocument();
  });

  it("renders the chain's logo", () => {
    render(<ChainCard chain={randomChainMock as Chain} />);
    const logo = screen.getByAltText(`${randomChainMock.pretty_name!} logo`);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", randomChainMock.logo_URIs?.svg);
  });
});
