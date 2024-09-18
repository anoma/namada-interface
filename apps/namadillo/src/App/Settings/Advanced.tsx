import { ActionButton, Input, Stack } from "@namada/components";
import { chainParametersAtom } from "atoms/chain";
import {
  indexerUrlAtom,
  rpcUrlAtom,
  updateIndexerUrlAtom,
  updateRpcUrlAtom,
} from "atoms/settings";
import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
import { useLocation } from "react-router-dom";

export const Advanced = (): JSX.Element => {
  const location = useLocation();

  const [currentRpc] = useAtom(rpcUrlAtom);
  const [rpcMutation] = useAtom(updateRpcUrlAtom);
  const [currentIndexer] = useAtom(indexerUrlAtom);
  const [indexerMutation] = useAtom(updateIndexerUrlAtom);
  const { data: chainParameters } = useAtomValue(chainParametersAtom);

  const [rpc, setRpc] = useState(currentRpc);
  const [indexer, setIndexer] = useState(currentIndexer);

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      await Promise.all([
        rpcMutation.mutateAsync(rpc),
        indexerMutation.mutateAsync(indexer),
      ]);
      document.location.href =
        location.state.backgroundLocation.pathname ?? location.pathname;
    } catch {}
  };

  const isPending = rpcMutation.isPending || indexerMutation.isPending;

  return (
    <form
      className="flex flex-col flex-1 justify-between text-base gap-6"
      onSubmit={onSubmit}
    >
      <Stack gap={6}>
        <Input
          type="text"
          value={indexer}
          error={
            indexerMutation.error instanceof Error &&
            indexerMutation.error.message
          }
          label="Indexer URL"
          className="[&_input]:border-neutral-300"
          onChange={(e) => {
            setIndexer(e.currentTarget.value);
            indexerMutation.reset();
          }}
          required
        />
        <Input
          type="text"
          value={rpc}
          error={
            rpcMutation.error instanceof Error && rpcMutation.error.message
          }
          label="RPC URL"
          className="[&_input]:border-neutral-300"
          onChange={(e) => {
            setRpc(e.currentTarget.value);
            rpcMutation.reset();
          }}
          required
        />
        <Input
          type="text"
          variant="ReadOnlyCopy"
          value={chainParameters?.chainId}
          label="Chain ID (provided by the Indexer)"
          disabled={true}
          className="[&_input]:border-neutral-800"
        />
      </Stack>
      <ActionButton
        className="shrink-0"
        disabled={isPending || indexerMutation.isError || rpcMutation.isError}
      >
        {isPending ? "Verifying..." : "Confirm"}
      </ActionButton>
    </form>
  );
};
