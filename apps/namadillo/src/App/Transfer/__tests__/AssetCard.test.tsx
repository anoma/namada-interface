import { render, screen } from "@testing-library/react";
import { AssetCard } from "App/Transfer/AssetCard";
import { assetMock } from "App/Transfer/__mocks__/assets";

describe("Component: AssetCard", () => {
  it("should render asset name", () => {
    render(<AssetCard asset={assetMock} />);
    expect(screen.getByText("Ethereum")).toBeInTheDocument();
  });
});
