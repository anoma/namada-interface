import { Chain } from "@chain-registry/types";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  namadaChainMock,
  randomChainMock,
} from "App/Transfer/__mocks__/chains";
import { TransferDestination } from "App/Transfer/TransferDestination";
import BigNumber from "bignumber.js";
import { walletMock } from "../__mocks__/providers";
import { parseChainInfo } from "../common";

describe("TransferDestination", () => {
  it("should render the component with the default props", () => {
    render(<TransferDestination />);
    expect(screen.getByText(/select chain/i)).toBeInTheDocument();
  });

  it("should render the TabSelector for shielded/transparent when onChangeShielded is provided", () => {
    render(
      <TransferDestination
        isShielded={true}
        onChangeShielded={jest.fn()}
        chain={parseChainInfo(namadaChainMock as Chain, true)}
      />
    );
    expect(screen.getByText("Shielded")).toBeInTheDocument();
    expect(screen.getByText("Transparent")).toBeInTheDocument();
  });

  it("should render a yellow border when transfer is shielded", () => {
    const { container } = render(<TransferDestination isShielded={true} />);
    expect(container.firstElementChild?.className).toContain("border-yellow");
  });

  it("should render nothing related to shielding when provided chain is not Namada", () => {
    render(
      <TransferDestination
        isShielded={true}
        chain={parseChainInfo(randomChainMock as Chain, true)}
        onChangeShielded={jest.fn()}
      />
    );
    expect(screen.queryByText(/shielded/i)).not.toBeInTheDocument();
  });

  it("should render correct chain name when shielded transfer is set", () => {
    render(
      <TransferDestination
        isShielded={true}
        chain={parseChainInfo(namadaChainMock as Chain, true)}
        wallet={walletMock}
      />
    );
    expect(screen.getByText(/namada shielded/i)).toBeInTheDocument();
  });

  it("should render correct chain name when transparent transfer is set", () => {
    render(
      <TransferDestination
        isShielded={false}
        chain={parseChainInfo(namadaChainMock as Chain, false)}
        wallet={walletMock}
      />
    );
    expect(screen.getByText(/namada transparent/i)).toBeInTheDocument();
  });

  it("should toggle between shielded and transparent", () => {
    const onChangeShieldedMock = jest.fn();
    render(
      <TransferDestination
        isShielded={true}
        chain={parseChainInfo(namadaChainMock as Chain, true)}
        onChangeShielded={onChangeShieldedMock}
      />
    );
    const transparentButton = screen.getByText("Transparent");
    fireEvent.click(transparentButton);
    expect(onChangeShieldedMock).toHaveBeenCalledWith(false);
  });

  it("should toggle between custom and my address when onToggleCustomAddress is provided", () => {
    const onToggleCustomAddressMock = jest.fn();
    render(
      <TransferDestination
        customAddressActive={false}
        onToggleCustomAddress={onToggleCustomAddressMock}
      />
    );
    const customAddressButton = screen.getByText("Custom Address");
    fireEvent.click(customAddressButton);
    expect(onToggleCustomAddressMock).toHaveBeenCalledWith(true);
  });

  it("should display the transaction fee if provided", () => {
    const fee = new BigNumber(0.01);
    render(<TransferDestination transactionFee={fee} />);
    const transactionFee = screen.getByText("Transaction Fee");
    expect(transactionFee).toBeInTheDocument();
    expect(transactionFee.parentNode?.textContent).toContain("0.01");
  });
});
