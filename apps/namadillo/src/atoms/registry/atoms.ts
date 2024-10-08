import { Chain } from "@chain-registry/types";
import { queryDependentFn } from "atoms/utils";
import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { atomFamily } from "jotai/utils";
import { getRandomRpcAddress } from "./functions";
import { queryAssetBalances } from "./services";

export type AssetAtomProps = {
  ownerAddress?: string;
  chain?: Chain;
};

export const assetsFamily = atomFamily((props: AssetAtomProps) => {
  if (!props.ownerAddress || !props.chain) return atom(() => undefined);

  return atomWithQuery(() => {
    return {
      queryKey: ["assets", props.chain?.chain_id],
      ...queryDependentFn(async () => {
        const rpc = getRandomRpcAddress(props.chain!);
        const balances = await queryAssetBalances(props.ownerAddress!, rpc);
      }, [Boolean(props.chain), !!props.ownerAddress]),
    };
  });
});
