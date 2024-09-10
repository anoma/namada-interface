import { ActionButton, Container, Input, Stack } from "@namada/components";
import { indexerUrlAtom, updateIndexerUrlAtom } from "atoms/settings";
import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
import { DISCORD_URL } from "urls";

export const Setup = (): JSX.Element => {
  const indexerUrl = useAtomValue(indexerUrlAtom);
  const [url, setUrl] = useState(indexerUrl || "");
  const [{ mutateAsync, reset, error, isPending, isError }] =
    useAtom(updateIndexerUrlAtom);

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      await mutateAsync(url);
    } catch {}
  };

  return (
    <Container
      className="text-white flex [&>div]:flex [&>div]:flex-col"
      header={
        <h1 className="text-xl text-center uppercase text-yellow font-medium mb-6">
          Namadillo
        </h1>
      }
    >
      <Stack gap={12} className="flex-1 h-full">
        <Stack gap={2.5}>
          <p>
            Welcome to Namadillo. Please provide a Namada indexer URL to
            complete your setup.
          </p>
          <p className="text-xs text-neutral-400">
            You can find a list of active indexers{" "}
            <a
              href={DISCORD_URL}
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>
            . You can change this setting at any time using the settings panel.
          </p>
        </Stack>
        <form
          className="w-full flex-1 flex flex-col justify-between"
          onSubmit={onSubmit}
        >
          <Input
            className="w-full"
            label="Indexer URL"
            placeholder="http://example.com:5000"
            value={url}
            error={error instanceof Error && error.message}
            onChange={(e) => {
              setUrl(e.target.value);
              reset();
            }}
          />
          <ActionButton disabled={isPending || isError}>
            {isPending ? "Verifying..." : "Confirm"}
          </ActionButton>
        </form>
      </Stack>
    </Container>
  );
};
