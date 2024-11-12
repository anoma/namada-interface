import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SelectAssetModal } from "App/Transfer/SelectAssetModal";
import { assetMockList } from "../__mocks__/assets";
import { walletMock } from "../__mocks__/providers";

describe("SelectAssetModal", () => {
  const onCloseMock = jest.fn();
  const onSelectMock = jest.fn();
  const mockAddress = "cosmos1xnu3p06fkke8hnl7t83hzhggrca59syf0wjqgh";

  it("should render the modal title", () => {
    render(
      <SelectAssetModal
        onClose={onCloseMock}
        onSelect={onSelectMock}
        assets={assetMockList}
        wallet={walletMock}
        walletAddress={mockAddress}
      />
    );
    expect(screen.getByText("Select Asset")).toBeInTheDocument();
  });

  it("should render all assets", () => {
    render(
      <SelectAssetModal
        onClose={onCloseMock}
        onSelect={onSelectMock}
        assets={assetMockList}
        wallet={walletMock}
        walletAddress={mockAddress}
      />
    );
    expect(screen.getByText("Bitcoin")).toBeInTheDocument();
    expect(screen.getByText("Ethereum")).toBeInTheDocument();
  });

  it("should filter assets based on search input", async () => {
    render(
      <SelectAssetModal
        onClose={onCloseMock}
        onSelect={onSelectMock}
        assets={assetMockList}
        wallet={walletMock}
        walletAddress={mockAddress}
      />
    );
    fireEvent.change(screen.getByPlaceholderText(/search/i, { exact: false }), {
      target: { value: "bit" },
    });

    // Event is debounced
    waitFor(() => {
      expect(screen.getByText("Bitcoin")).toBeInTheDocument();
      expect(screen.queryByText("Ethereum")).not.toBeInTheDocument();
    });
  });

  it("should call onSelect and onClose when an asset is selected", () => {
    render(
      <SelectAssetModal
        onClose={onCloseMock}
        onSelect={onSelectMock}
        assets={assetMockList}
        wallet={walletMock}
        walletAddress={mockAddress}
      />
    );
    fireEvent.click(screen.getByText("Bitcoin"));
    expect(onSelectMock).toHaveBeenCalledWith(assetMockList[1].originalAddress);
    expect(onCloseMock).toHaveBeenCalled();
  });
});
