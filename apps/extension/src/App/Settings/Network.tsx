import { sanitize } from "isomorphic-dompurify";

import {
  ActionButton,
  Alert,
  GapPatterns,
  Input,
  Stack,
} from "@namada/components";
import { PageHeader } from "App/Common";
import { GetChainMsg, UpdateChainMsg } from "background/chain";
import { useRequester } from "hooks/useRequester";
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
  const [status, setStatus] = useState<Status>(Status.Unsubmitted);
  const [errorMessage, setErrorMessage] = useState("");

  const shouldDisableSubmit = status === Status.Pending || !chainId;

  useEffect(() => {
    void (async () => {
      try {
        const chainId = await requester.sendMessage(
          Ports.Background,
          new GetChainMsg()
        );
        const santizedChainId = sanitize(chainId);
        setChainId(santizedChainId);
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

      // Validate sanitized chain ID
      if (!sanitizedChainId) {
        setErrorMessage("Invalid chain ID!");
        setStatus(Status.Failed);
        return;
      }

      try {
        await requester.sendMessage(
          Ports.Background,
          new UpdateChainMsg(sanitizedChainId)
        );
        setStatus(Status.Complete);
      } catch (err) {
        setStatus(Status.Failed);
        setErrorMessage(`${err}`);
      }
    },
    [chainId]
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
