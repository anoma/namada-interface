import { ExtensionRequester } from "extension";
import { useContext } from "react";
import { RequesterContext } from "services";

export const useRequester = (): ExtensionRequester => {
  const requesterContext = useContext(RequesterContext);

  if (!requesterContext) {
    throw new Error(
      "requesterContext has to be used within <RequesterContext.Provider>"
    );
  }

  return requesterContext;
};
