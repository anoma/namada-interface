import { ActionButton, Input, Stack } from "@namada/components";
import { chainParametersAtom } from "atoms/chain";
import {
  indexerUrlAtom,
  maspIndexerUrlAtom,
  rpcUrlAtom,
  updateIndexerUrlAtom,
  updateMaspIndexerUrlAtom,
  updateRpcUrlAtom,
} from "atoms/settings";
import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
import { useLocation } from "react-router-dom";

export const Advanced = (): JSX.Element => {
  const location = useLocation();
  const rpcMutation = useAtomValue(updateRpcUrlAtom);
  const indexerMutation = useAtomValue(updateIndexerUrlAtom);
  const [currentMaspIndexer] = useAtom(maspIndexerUrlAtom);
  const [currentRpcUrl] = useAtom(rpcUrlAtom);
  const [currentIndexerUrl] = useAtom(indexerUrlAtom);
  const [maspIndexerMutation] = useAtom(updateMaspIndexerUrlAtom);
  const { data: chainParameters } = useAtomValue(chainParametersAtom);
  const [rpc, setRpc] = useState(currentRpcUrl);
  const [indexer, setIndexer] = useState(currentIndexerUrl);
  const [maspIndexer, setMaspIndexer] = useState(currentMaspIndexer);

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      await Promise.all([
        rpcMutation.mutateAsync(rpc),
        indexerMutation.mutateAsync(indexer),
        maspIndexerMutation.mutateAsync(maspIndexer),
      ]);
      document.location.href =
        location.state.backgroundLocation.pathname ?? location.pathname;
    } catch {}
  };

  const isPending =
    rpcMutation.isPending ||
    indexerMutation.isPending ||
    maspIndexerMutation.isPending;

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
          placeholder="Optional"
          value={maspIndexer}
          error={
            maspIndexerMutation.error instanceof Error &&
            maspIndexerMutation.error.message
          }
          label="MASP Indexer URL"
          className="[&_input]:border-neutral-300"
          onChange={(e) => {
            setMaspIndexer(e.currentTarget.value);
            maspIndexerMutation.reset();
          }}
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
