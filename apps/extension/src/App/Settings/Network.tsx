import { sanitize } from "dompurify";

import {
  ActionButton,
  Alert,
  GapPatterns,
  Input,
  Stack,
} from "@namada/components";
import { isUrlValid } from "@namada/utils";
import { PageHeader } from "App/Common";
import { UpdateChainMsg } from "background/chains";
import { useRequester } from "hooks/useRequester";
import { GetChainMsg } from "provider";
import React, { useCallback, useEffect, useState } from "react";
import { Ports } from "router";

enum Status {
  Unsubmitted,
  Pending,
  Complete,
  Failed,
}

export const Network = (): JSX.Element => {
  const requester = useRequester();
  const [chainId, setChainId] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>(Status.Unsubmitted);
  const [errorMessage, setErrorMessage] = useState("");

  // TODO: Validate URL and sanitize inputs!
  const shouldDisableSubmit = status === Status.Pending || !chainId || !url;

  useEffect(() => {
    (async () => {
      try {
        const chain = await requester.sendMessage(
          Ports.Background,
          new GetChainMsg()
        );
        if (!chain) {
          throw new Error("Chain not found!");
        }
        const { chainId, rpc } = chain;
        setUrl(rpc);
        setChainId(chainId);
      } catch (e) {
        setErrorMessage(`${e}`);
      }
    })();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      setStatus(Status.Pending);
      setErrorMessage("");
      const sanitizedChainId = sanitize(chainId);
      const sanitizedUrl = sanitize(url);

      // Validate sanitized chain ID
      if (!sanitizedChainId) {
        setErrorMessage("Invalid chain ID!");
        setStatus(Status.Failed);
        return;
      }

      // Validate sanitized URL
      const isValidUrl = isUrlValid(sanitizedUrl);
      if (!isValidUrl) {
        setErrorMessage("Invalid URL!");
        setStatus(Status.Failed);
        return;
      }

      try {
        await requester.sendMessage(
          Ports.Background,
          new UpdateChainMsg(sanitizedChainId, sanitizedUrl)
        );
        setStatus(Status.Complete);
      } catch (err) {
        setStatus(Status.Failed);
        setErrorMessage(`${err}`);
      }
    },
    [chainId, url]
  );

  return (
    <Stack
      as="form"
      gap={GapPatterns.TitleContent}
      onSubmit={handleSubmit}
      full
    >
      <PageHeader title="Network" />
      <Stack className="justify-center" full gap={GapPatterns.FormFields}>
        <Input
          label="Chain ID"
          variant="Text"
          type="text"
          value={chainId}
          onChange={(e) => setChainId(e.target.value)}
          error={chainId.length === 0 ? "Chain ID required!" : ""}
        />
        <Input
          label="URL"
          variant="Text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          error={url.length === 0 ? "URL is required!" : ""}
        />
        {errorMessage && <Alert type="error">{errorMessage}</Alert>}
        {status === Status.Complete && (
          <Alert type="info">Successfully updated network!</Alert>
        )}
      </Stack>
      <ActionButton
        size="md"
        disabled={shouldDisableSubmit}
        onSubmit={handleSubmit}
      >
        Submit
      </ActionButton>
    </Stack>
  );
};
