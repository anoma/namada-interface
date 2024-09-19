import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { WalletCard } from "App/Transfer/WalletCard";
import { walletMock } from "../__mocks__/providers";

describe("Component: WalletCard", () => {
  it("should render wallet name and icon", () => {
    render(
      <WalletCard wallet={walletMock} installed={false} connected={false} />
    );

    expect(screen.getByText("Keplr")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", walletMock.iconUrl);
  });

  const mockUserAgent = (userAgent: string): void => {
    const fn = jest.spyOn(navigator, "userAgent", "get");
    fn.mockReturnValue(userAgent);
  };

  it("should show 'Install' with correct link if wallet is not installed", () => {
    const chromeUserAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36`;
    const firefoxUserAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:130.0) Gecko/20100101 Firefox/130.0`;

    // Render Chrome url
    mockUserAgent(chromeUserAgent);
    render(
      <WalletCard wallet={walletMock} installed={false} connected={false} />
    );
    const chromeLink = screen.getByText(/install/i);
    expect(chromeLink).toBeInTheDocument();
    expect(chromeLink).toHaveAttribute("href", walletMock.downloadUrl.chrome);

    // Render firefox url
    cleanup();
    jest.clearAllMocks();
    mockUserAgent(firefoxUserAgent);
    render(
      <WalletCard wallet={walletMock} installed={false} connected={false} />
    );
    const firefoxLink = screen.getByText(/install/i);
    expect(firefoxLink).toHaveAttribute("href", walletMock.downloadUrl.firefox);
  });

  it("should show 'Connect' button if wallet is installed but not connected", () => {
    const onConnectMock = jest.fn();
    render(
      <WalletCard
        wallet={walletMock}
        installed={true}
        connected={false}
        onConnect={onConnectMock}
      />
    );

    const connectButton = screen.getByText(/connect/i);
    expect(connectButton).toBeInTheDocument();

    fireEvent.click(connectButton);
    expect(onConnectMock).toHaveBeenCalled();
  });

  it("should show 'Select' button if wallet is installed and connected", () => {
    const onSelectMock = jest.fn();
    render(
      <WalletCard
        wallet={walletMock}
        installed={true}
        connected={true}
        onSelect={onSelectMock}
      />
    );

    const selectButton = screen.getByText(/select/i);
    expect(selectButton).toBeInTheDocument();

    fireEvent.click(selectButton);
    expect(onSelectMock).toHaveBeenCalled();
  });
});
