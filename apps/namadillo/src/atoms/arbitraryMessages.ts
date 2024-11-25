import { NamadaKeychain } from "hooks/useNamadaKeychain";
import invariant from "invariant";
import { atomWithMutation } from "jotai-tanstack-query";
import { defaultAccountAtom } from "./accounts";

export const arbitraryMessagesAtom = atomWithMutation((get) => {
  const namadaPromise = new NamadaKeychain().get();
  const account = get(defaultAccountAtom);
  return {
    enabled: account.data,
    mutationFn: async (message: string) => {
      invariant(account.data, "Default account is not selected");
      const response = await namadaPromise.then((injectedNamada) =>
        injectedNamada
          ?.getSigner()
          .signArbitrary(account.data!.address, message)
      );
      return response;
    },
  };
});
