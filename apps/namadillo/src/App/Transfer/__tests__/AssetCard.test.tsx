import { Asset } from "@chain-registry/types";
import { render, screen } from "@testing-library/react";
import { AssetCard } from "App/Transfer/AssetCard";
import { assetMock, assetWithoutLogo } from "App/Transfer/__mocks__/assets";

describe("Component: AssetCard", () => {
  it("should render asset name", () => {
    render(<AssetCard asset={assetMock as Asset} />);
    expect(screen.getByText("Ethereum")).toBeInTheDocument();
  });

  it("should render asset logo if available", () => {
    render(<AssetCard asset={assetMock as Asset} />);
    const logo = screen.getByAltText("Ethereum logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", assetMock.logo_URIs?.svg);
  });

  it("should render placeholder if logo is not available", () => {
    render(<AssetCard asset={assetWithoutLogo as Asset} />);
    expect(screen.getByAltText(/logo not available/i)).toBeInTheDocument();
  });
});
