import { useProviderStatus } from "hooks/useProviderStatus";
import { ReactNode } from "react";
import { PageLoader } from "../Common/PageLoader";

export const ExtensionLoader = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const status = useProviderStatus("namada");
  const extensionReady = status !== "connecting";

  if (!extensionReady) {
    return <PageLoader />;
  }

  return <>{children}</>;
};
