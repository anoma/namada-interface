import { Panel } from "@namada/components";
import { NavigationFooter } from "App/AccountOverview/NavigationFooter";
import { ConnectPanel } from "App/Common/ConnectPanel";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { IbcTransfer } from "App/Ibc/IbcTransfer";
import { IbcWithdraw } from "App/Ibc/IbcWithdraw";
import { LearnAboutIbc } from "App/Ibc/LearnAboutIbc";
import { Sidebar } from "App/Layout/Sidebar";
import { LearnAboutMasp } from "App/Masp/LearnAboutMasp";
import { MaspShield } from "App/Masp/MaspShield";
import { MaspUnshield } from "App/Masp/MaspUnshield";
import { LearnAboutTransfer } from "App/NamadaTransfer/LearnAboutTransfer";
import { NamadaTransfer } from "App/NamadaTransfer/NamadaTransfer";
import { routes } from "App/routes";
import { MaspAssetRewards } from "App/Sidebars/MaspAssetRewards";
import { allDefaultAccountsAtom } from "atoms/accounts";
import { shieldedBalanceAtom } from "atoms/balance";
import { applicationFeaturesAtom } from "atoms/settings";
import { useUserHasAccount } from "hooks/useIsAuthenticated";
import { useUrlState } from "hooks/useUrlState";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isTransparentAddress } from ".";
import { TransferType } from "./types";
import { determineTransferType } from "./utils";

export const TransferLayout: React.FC = () => {
  const userHasAccount = useUserHasAccount();
  const features = useAtomValue(applicationFeaturesAtom);

  // Extract both values and setters from useUrlState
  const [sourceAddress, setSourceAddress] = useUrlState("source");
  const [destinationAddress, setDestinationAddress] =
    useUrlState("destination");

  const navigate = useNavigate();
  const location = useLocation();

  const { refetch: refetchShieldedBalance } = useAtomValue(shieldedBalanceAtom);
  const { data: accounts } = useAtomValue(allDefaultAccountsAtom);

  // Determine transfer type based on both addresses AND current route
  const getTransferTypeFromRoute = (pathname: string): TransferType | null => {
    if (pathname === routes.ibc) return "ibc-deposit";
    if (pathname === routes.ibcWithdraw) return "ibc-withdraw";
    if (pathname === routes.maspShield) return "shield";
    if (pathname === routes.maspUnshield) return "unshield";
    if (pathname === routes.transfer) return "namada-transfer";
    return null;
  };

  const routeBasedTransferType = getTransferTypeFromRoute(location.pathname);
  const addressBasedTransferType = determineTransferType({
    sourceAddress,
    destinationAddress,
  });

  // Use route-based type if available, otherwise fall back to address-based determination
  const transferType = routeBasedTransferType || addressBasedTransferType;

  const transparentAddress =
    accounts?.find((acc) => isTransparentAddress(acc.address))?.address ?? "";

  // Refetch shielded balance for MASP operations
  useEffect(() => {
    if (transferType === "shield" || transferType === "unshield") {
      refetchShieldedBalance();
    }
  }, [transferType, refetchShieldedBalance]);

  // Only navigate if the addresses suggest a different transfer type than the current route
  useEffect(() => {
    // Don't auto-navigate if we're already on a route that explicitly handles a transfer type
    if (routeBasedTransferType) {
      // Only set default source address for namada transfers if none exists
      if (
        transferType === "namada-transfer" &&
        !sourceAddress &&
        transparentAddress
      ) {
        const searchParams = new URLSearchParams(location.search);
        searchParams.set("source", transparentAddress);
        navigate(`${location.pathname}?${searchParams.toString()}`, {
          replace: true,
        });
      }
      return;
    }

    // Only navigate based on address-based transfer type if we're not on a specific route
    const currentPath = location.pathname;
    let targetRoute = "";

    switch (addressBasedTransferType) {
      case "ibc-deposit":
        targetRoute = routes.ibc;
        break;
      case "ibc-withdraw":
        targetRoute = routes.ibcWithdraw;
        break;
      case "shield":
        targetRoute = routes.maspShield;
        break;
      case "unshield":
        targetRoute = routes.maspUnshield;
        break;
      default:
        targetRoute = routes.transfer;
    }

    if (currentPath !== targetRoute) {
      const searchParams = new URLSearchParams(location.search);
      navigate(`${targetRoute}?${searchParams.toString()}`, {
        replace: true,
      });
    }
  }, [
    addressBasedTransferType,
    routeBasedTransferType,
    sourceAddress,
    destinationAddress,
    navigate,
    location,
    transparentAddress,
    transferType,
  ]);

  if (!userHasAccount) {
    const actionText = (() => {
      switch (transferType) {
        case "shield":
        case "unshield":
          return "To shield assets";
        case "ibc-deposit":
        case "ibc-withdraw":
          return "To IBC Transfer";
        default:
          return "To transfer assets";
      }
    })();
    return <ConnectPanel actionText={actionText} />;
  }

  // Render content based on transfer type
  const renderContent = (): JSX.Element => {
    if (transferType === "ibc-deposit") {
      // IBC Deposit - render IbcTransfer component directly
      return (
        <Panel className="py-8 rounded-t-none h-full">
          <IbcTransfer
            sourceAddress={sourceAddress}
            setSourceAddress={setSourceAddress}
            destinationAddress={destinationAddress}
            setDestinationAddress={setDestinationAddress}
          />
        </Panel>
      );
    }

    if (transferType === "ibc-withdraw") {
      // IBC Withdraw - render IbcWithdraw component directly
      return (
        <Panel className="py-8 rounded-t-none h-full">
          <IbcWithdraw
            sourceAddress={sourceAddress}
            setSourceAddress={setSourceAddress}
            destinationAddress={destinationAddress}
            setDestinationAddress={setDestinationAddress}
          />
        </Panel>
      );
    }

    if (transferType === "shield") {
      // MASP Shield - render MaspShield component directly
      return (
        <div className="flex relative flex-col flex-1">
          <MaspShield
            sourceAddress={sourceAddress}
            setSourceAddress={setSourceAddress}
            destinationAddress={destinationAddress}
            setDestinationAddress={setDestinationAddress}
          />
        </div>
      );
    }

    if (transferType === "unshield") {
      // MASP Unshield - render MaspUnshield component directly
      return (
        <div className="flex relative flex-col flex-1">
          <MaspUnshield
            sourceAddress={sourceAddress}
            setSourceAddress={setSourceAddress}
            destinationAddress={destinationAddress}
            setDestinationAddress={setDestinationAddress}
          />
        </div>
      );
    }

    // Default namada transfer - render NamadaTransfer component directly
    return (
      <NamadaTransfer
        sourceAddress={sourceAddress}
        setSourceAddress={setSourceAddress}
        destinationAddress={destinationAddress}
        setDestinationAddress={setDestinationAddress}
      />
    );
  };

  // Render sidebar based on transfer type
  const renderSidebar = (): JSX.Element => {
    const isIbcTransfer =
      transferType === "ibc-deposit" || transferType === "ibc-withdraw";
    const isMaspTransfer =
      transferType === "shield" || transferType === "unshield";

    if (isIbcTransfer) {
      return <LearnAboutIbc />;
    }

    if (isMaspTransfer) {
      return (
        <>
          {features.shieldingRewardsEnabled && <MaspAssetRewards />}
          <LearnAboutMasp />
        </>
      );
    }

    return <LearnAboutTransfer />;
  };

  return (
    <PageWithSidebar>
      <div className="flex flex-col min-h-full">
        <div className="flex flex-1">{renderContent()}</div>
        <NavigationFooter className="mt-2 flex-none h-16" />
      </div>
      <Sidebar>{renderSidebar()}</Sidebar>
    </PageWithSidebar>
  );
};
