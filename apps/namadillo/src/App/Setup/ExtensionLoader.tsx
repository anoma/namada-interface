import { useUntilIntegrationAttached } from "@namada/integrations";
import { ReactNode } from "react";
import { PageLoader } from "../Common/PageLoader";

export const ExtensionLoader = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const extensionAttachStatus = useUntilIntegrationAttached();
  const extensionReady = extensionAttachStatus !== "pending";

  if (!extensionReady) {
    return <PageLoader />;
  }

  return <>{children}</>;
};
