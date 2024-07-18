import { integrations } from "@namada/integrations";
import { WasmHash } from "@namada/types";
import { chainAtom, nativeTokenAddressAtom } from "atoms/chain";
import { fetchWasmHashes } from "atoms/checksums";
import { namadaExtensionConnectedAtom, rpcUrlAtom } from "atoms/settings";
import { atomWithQuery } from "jotai-tanstack-query";

export const checksumsAtom = atomWithQuery<WasmHash[]>((get) => {
  const chain = get(chainAtom);
  const rpcUrl = get(rpcUrlAtom);
  const extensionConnected = get(namadaExtensionConnectedAtom);
  const nativeToken = get(nativeTokenAddressAtom);
  const integration = integrations.namada;
  const chainId = chain.data?.chainId;

  return {
    queryKey: ["checksums", chainId],
    staleTime: Infinity,
    enabled:
      !!rpcUrl &&
      !!chainId &&
      extensionConnected &&
      nativeToken.status === "success",
    queryFn: async () => fetchWasmHashes(chain.data!.chainId, integration),
  };
});
