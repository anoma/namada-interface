import { walletMock } from "../__mocks__/providers";
const testWalletAddress = "0x1234567890abcdefghijkl";
const mockIntegration = {
  detect: jest.fn(),
  connect: jest.fn(),
  accounts: jest.fn().mockResolvedValue([{ address: testWalletAddress }]),
};

// Avoid hoisting
(() => {
  jest.mock("@namada/integrations", () => ({
    integrations: {
      [walletMock.id]: mockIntegration,
    },
  }));
})();

import { shortenAddress } from "@namada/utils";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { SelectedWallet } from "App/Transfer/SelectedWallet";

describe("Component: SelectedWallet", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the wallet icon", async () => {
    await act(async () => {
      render(<SelectedWallet wallet={walletMock} />);
    });
    const walletIcon = screen.getByAltText(/logo/i, { exact: false });
    expect(walletIcon).toBeInTheDocument();
    expect(walletIcon).toHaveAttribute("src", walletMock.iconUrl);
  });

  it("should display the shortened wallet address after loading accounts", async () => {
    render(<SelectedWallet wallet={walletMock} />);

    // Wait for the address to be loaded
    await waitFor(() => {
      expect(mockIntegration.connect).toHaveBeenCalled();
      expect(mockIntegration.accounts).toHaveBeenCalled();
    });

    // Check if the address is correctly shortened
    const shortenedAddress = shortenAddress(testWalletAddress, 8, 6);
    expect(screen.getByText(shortenedAddress)).toBeInTheDocument();
  });

  it("should trigger the onClick function when clicked", async () => {
    const onClickMock = jest.fn();
    await act(async () => {
      render(<SelectedWallet wallet={walletMock} onClick={onClickMock} />);
    });
    const walletButton = screen.getByRole("button");
    fireEvent.click(walletButton);
    expect(onClickMock).toHaveBeenCalled();
  });

  it("should handle missing wallet address gracefully", async () => {
    //Mock integration to return no accounts
    mockIntegration.accounts.mockResolvedValue([]);

    await act(async () => {
      render(<SelectedWallet wallet={walletMock} />);
    });

    // Wait for the component to try loading accounts
    await waitFor(() => {
      expect(mockIntegration.accounts).toHaveBeenCalled();
    });

    // Check that no address is displayed
    expect(screen.queryByText(/0x/i)).toBeNull();
  });
});
