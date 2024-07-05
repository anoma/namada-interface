import { getIntegration } from "@namada/integrations";
import invariant from "invariant";
import { atomWithMutation } from "jotai-tanstack-query";
import { defaultAccountAtom } from "./accounts";

export const arbitraryMessagesAtom = atomWithMutation((get) => {
  const integration = getIntegration("namada");
  const account = get(defaultAccountAtom);
  return {
    enabled: account.data,
    mutationFn: async (message: string) => {
      invariant(account.data, "Default account is not selected");
      const response = await integration
        .signer()
        ?.signArbitrary(account.data?.address, message);
      return response;
    },
  };
});
