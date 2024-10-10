import { useIntegration } from "@namada/integrations";
import {
  namadaExtensionAttachStatus,
  namadaExtensionConnectionStatus,
} from "atoms/settings";
import { useAtom, useSetAtom } from "jotai";
import { ReactNode, useEffect } from "react";
import { PageLoader } from "../Common/PageLoader";

export const ExtensionLoader = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [attachStatus, setAttachStatus] = useAtom(namadaExtensionAttachStatus);
  const setConnectionStatus = useSetAtom(namadaExtensionConnectionStatus);
  const integration = useIntegration("namada");

  useEffect(() => {
    setAttachStatus(integration.detect() ? "attached" : "detached");

    integration.isConnected().then((isConnected) => {
      if (isConnected) {
        setConnectionStatus("connected");
      }
    });
  }, [integration]);

  if (attachStatus === "pending") {
    return <PageLoader />;
  }

  return <>{children}</>;
};
