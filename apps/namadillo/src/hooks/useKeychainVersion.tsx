import { useEffect, useState } from "react";
import { NamadaKeychain } from "./useNamadaKeychain";

export const useKeychainVersion = (): string | undefined => {
  const [version, setVersion] = useState<string>();
  useEffect(() => {
    (async () => {
      const namadaKeychain = await new NamadaKeychain().get();
      if (namadaKeychain) {
        const version = namadaKeychain.version();
        setVersion(version);
      }
    })();
  }, []);

  return version;
};
