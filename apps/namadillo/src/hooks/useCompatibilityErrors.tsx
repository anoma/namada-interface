import { indexerHeartbeatAtom } from "atoms/settings";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import {
  checkIndexerCompatibilityErrors,
  checkInterfaceCompatibilityError,
  checkKeychainCompatibilityError,
} from "utils/compatibility";
import { useNamadaKeychain } from "./useNamadaKeychain";

export const useCompatibilityErrors = (): React.ReactNode | undefined => {
  const indexerHealth = useAtomValue(indexerHeartbeatAtom);
  const keychain = useNamadaKeychain();
  const [errorMessage, setErrorMessage] = useState<
    React.ReactNode | undefined
  >();

  const verifyKeychainVersion = async (): Promise<void> => {
    const namadaKeychain = await keychain.namadaKeychain.get();
    if (namadaKeychain) {
      const version = namadaKeychain.version();
      const versionErrorMessage = checkKeychainCompatibilityError(version);
      if (versionErrorMessage) {
        setErrorMessage(versionErrorMessage);
      }
    }
  };

  const verifyIndexerVersion = async (): Promise<void> => {
    const versionErrorMessage = checkIndexerCompatibilityErrors(
      indexerHealth.data?.version || ""
    );

    if (versionErrorMessage) {
      setErrorMessage(versionErrorMessage);
    }
  };

  const verifyInterfaceVersion = async (): Promise<void> => {
    const versionErrorMessage = await checkInterfaceCompatibilityError();
    if (versionErrorMessage) {
      setErrorMessage(versionErrorMessage);
    }
  };

  useEffect(() => {
    verifyKeychainVersion();
  }, []);

  useEffect(() => {
    indexerHealth.isSuccess && verifyIndexerVersion();
  }, [indexerHealth]);

  useEffect(() => {
    verifyInterfaceVersion();
  }, []);

  return errorMessage;
};
