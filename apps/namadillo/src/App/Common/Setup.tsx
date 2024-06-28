import { ActionButton, Container, Input, Stack } from "@namada/components";
import { isUrlValid } from "@namada/utils";
import { indexerUrlAtom, isIndexerAlive } from "atoms/settings";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { DISCORD_URL } from "urls";

type SetupProps = {
  onChange: (newUrl: string) => void;
};

export const Setup = ({ onChange }: SetupProps): JSX.Element => {
  const indexerUrl = useAtomValue(indexerUrlAtom);
  const [url, setUrl] = useState(indexerUrl || "");
  const [validatingUrl, setValidatingUrl] = useState(false);
  const [error, setError] = useState("");
  const setIndexerAtom = useSetAtom(indexerUrlAtom);

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const trimmedUrl = url.trim();
    const sanitizedUrl =
      trimmedUrl.endsWith("/") ? trimmedUrl.slice(0, -1) : url;

    if (!isUrlValid(sanitizedUrl)) {
      setError(
        "Error: Invalid URL. Please provide a valid Namada indexer URL to complete your setup."
      );
      return;
    }

    setValidatingUrl(true);
    if (await isIndexerAlive(sanitizedUrl)) {
      setIndexerAtom(sanitizedUrl);
      onChange(sanitizedUrl);
    } else {
      setError(
        "Error: Couldn't reach the indexer URL. Please provide a valid indexer service."
      );
    }
    setValidatingUrl(false);
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
              rel="nofollow noreferrer"
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
            error={error}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
            }}
          />
          <ActionButton
            size="lg"
            borderRadius="sm"
            disabled={validatingUrl || !!error}
          >
            {validatingUrl ? "Verifying..." : "Confirm"}
          </ActionButton>
        </form>
      </Stack>
    </Container>
  );
};
