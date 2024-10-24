import { useIntegration } from "@namada/integrations";
import { chainParametersAtom } from "atoms/chain";
import {
  namadaExtensionAttachStatus,
  namadaExtensionConnectionStatus,
} from "atoms/settings";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
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
  const { data: chain } = useAtomValue(chainParametersAtom);

  useEffect(() => {
    setAttachStatus(integration.detect() ? "attached" : "detached");

    chain?.chainId &&
      integration.isConnected(chain.chainId).then((isConnected) => {
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
