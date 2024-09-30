import { fireEvent, render, screen } from "@testing-library/react";
import {
  TransferSource,
  TransferSourceProps,
} from "App/Transfer/TransferSource";
import BigNumber from "bignumber.js";
import { namadaChainMock } from "../__mocks__/chains";
import { walletMock } from "../__mocks__/providers";

describe("Component: TransferSource", () => {
  it("should render the component with the default props", () => {
    render(
      <TransferSource isConnected={false} openProviderSelector={jest.fn()} />
    );
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
    expect(screen.getByText(/select chain/i)).toBeInTheDocument();
  });

  const setup = (props: Partial<TransferSourceProps> = {}): void => {
    render(
      <TransferSource
        isConnected={false}
        openProviderSelector={jest.fn()}
        {...props}
      />
    );
  };

  const getEmptyChain = (): HTMLElement => {
    return screen.getByText(/select chain/i);
  };

  const getEmptyAsset = (): HTMLElement => {
    return screen.getByText(/asset/i);
  };

  it("should call onConnectProvider when Connect Wallet button is clicked", () => {
    const onConnectProviderMock = jest.fn();
    setup({ openProviderSelector: onConnectProviderMock });
    fireEvent.click(screen.getByText("Connect Wallet"));
    expect(onConnectProviderMock).toHaveBeenCalled();
  });

  it("should call openChainSelector when the SelectedChain is clicked", () => {
    const openChainSelectorMock = jest.fn();
    setup({
      openChainSelector: openChainSelectorMock,
      wallet: walletMock,
    });
    const chain = getEmptyChain();
    fireEvent.click(chain);
    expect(openChainSelectorMock).toHaveBeenCalled();
  });

  it("should render controls disabled when chain is not defined", () => {
    const openAssetSelectorMock = jest.fn();
    setup({ openAssetSelector: openAssetSelectorMock });
    const assetControl = getEmptyAsset();
    fireEvent.click(assetControl);
    expect(openAssetSelectorMock).not.toHaveBeenCalled();
    const amountInput = screen.getByDisplayValue("0");
    expect(amountInput).toBeDisabled();
  });

  it("should call openAssetSelector when the SelectedAsset is clicked", () => {
    const openAssetSelectorMock = jest.fn();
    setup({ openAssetSelector: openAssetSelectorMock, chain: namadaChainMock });
    const assetControl = getEmptyAsset();
    fireEvent.click(assetControl);
    expect(openAssetSelectorMock).toHaveBeenCalled();
  });

  it("should render the amount input with the correct value", () => {
    const amount = new BigNumber(100);
    setup({ amount });
    const amountInput = screen.getByDisplayValue("100");
    expect(amountInput).toBeInTheDocument();
  });

  it("should call onChangeAmount when the amount input is changed", () => {
    const onChangeAmountMock = jest.fn();
    setup({ amount: new BigNumber(0), onChangeAmount: onChangeAmountMock });
    const amountInput = screen.getByDisplayValue("0");
    fireEvent.change(amountInput, { target: { value: new BigNumber("200") } });
    expect(onChangeAmountMock).toHaveBeenCalled();
  });
});
