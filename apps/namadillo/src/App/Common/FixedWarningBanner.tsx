import { indexerHeartbeatAtom } from "atoms/settings";
import { useNamadaKeychain } from "hooks/useNamadaKeychain";
import { useAtomValue } from "jotai";
import { ReactNode, useEffect, useState } from "react";
import { IoWarning } from "react-icons/io5";
import {
  checkIndexerCompatibilityErrors,
  checkKeychainCompatibilityError,
} from "utils/compatibility";

export const FixedWarningBanner = (): JSX.Element => {
  const [errorMessage, setErrorMessage] = useState<ReactNode | undefined>();
  const indexerHealth = useAtomValue(indexerHeartbeatAtom);
  const keychain = useNamadaKeychain();

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

  useEffect(() => {
    verifyKeychainVersion();
  }, [keychain]);

  useEffect(() => {
    indexerHealth.isSuccess && verifyIndexerVersion();
  }, [indexerHealth]);

  if (!errorMessage) return <></>;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-yellow z-[9999]">
      <div className="flex flex-row justify-center items-center gap-1 px-12 py-3 text-sm [&_a]:underline">
        <strong className="inline-flex items-center">
          <IoWarning /> WARNING:{" "}
        </strong>
        <div>{errorMessage}</div>
      </div>
    </div>
  );
};
