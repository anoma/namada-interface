import { chainParametersAtom } from "atoms/chain";
import {
  namadaExtensionAttachStatus,
  namadaExtensionConnectionStatus,
} from "atoms/settings";
import { useNamadaKeychain } from "hooks/useNamadaKeychain";
import { useAtom, useAtomValue } from "jotai";
import { ReactNode, useEffect } from "react";
import { PageLoader } from "../Common/PageLoader";

export const ExtensionLoader = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const { namadaKeychain } = useNamadaKeychain();
  const [attachStatus, setAttachStatus] = useAtom(namadaExtensionAttachStatus);
  const { data: chain } = useAtomValue(chainParametersAtom);
  const [connectStatus, setConnectionStatus] = useAtom(
    namadaExtensionConnectionStatus
  );

  const chainId = chain?.chainId;
  const keychainPromise = namadaKeychain.get();

  useEffect(() => {
    keychainPromise.then((injectedNamada) => {
      if (injectedNamada) {
        return setAttachStatus("attached");
      }
      setAttachStatus("detached");
    });
  }, []);

  useEffect(() => {
    if (chainId && attachStatus === "attached") {
      keychainPromise.then((injectedNamada) => {
        injectedNamada.isConnected(chainId).then((isConnected) => {
          if (isConnected) {
            return setConnectionStatus("connected");
          }

          // If extension is currently connected, but there is a mismatch in chain IDs,
          // prompt for re-approval
          if (connectStatus === "connected") {
            injectedNamada.connect(chainId);
          }
        });
      });
    }
  }, [attachStatus, chainId]);

  if (attachStatus === "pending") {
    return <PageLoader />;
  }

  return <>{children}</>;
};
