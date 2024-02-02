import { ActionButton, Alert, AmountInput, Input } from "@namada/components";
import BigNumber from "bignumber.js";
import { sanitize } from "dompurify";
import React, { useCallback, useContext, useEffect, useState } from "react";

import { useTheme } from "styled-components";
import {
  TransferResponse,
  computePowSolution,
  requestChallenge,
  requestTransfer,
} from "utils";
import {
  ButtonContainer,
  FaucetFormContainer,
  FormStatus,
  InputContainer,
  PreFormatted,
} from "./Faucet.components";

import { bech32mValidation } from "@namada/utils";
import { AppContext } from "./App";

enum Status {
  Pending,
  Completed,
  Error,
}

type Props = {
  isTestnetLive: boolean;
};

const bech32mPrefix = "tnam";

export const FaucetForm: React.FC<Props> = ({ isTestnetLive }) => {
  const theme = useTheme();
  const { difficulty, settingsError, limit, tokens, url } =
    useContext(AppContext);
  const [targetAddress, setTargetAddress] = useState<string>();
  const [tokenAddress, setTokenAddress] = useState<string>();
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState(Status.Completed);
  const [statusText, setStatusText] = useState<string>();
  const [responseDetails, setResponseDetails] = useState<TransferResponse>();

  useEffect(() => {
    if (tokens?.NAM) {
      setTokenAddress(tokens.NAM);
    }
  }, [tokens]);

  const isFormValid: boolean =
    Boolean(tokenAddress) &&
    Boolean(amount) &&
    (amount || 0) <= limit &&
    Boolean(targetAddress) &&
    status !== Status.Pending &&
    typeof difficulty !== "undefined" &&
    isTestnetLive;

  const handleSubmit = useCallback(async () => {
    if (
      !targetAddress ||
      !amount ||
      !tokenAddress ||
      typeof difficulty === "undefined"
    ) {
      console.error("Please provide the required values!");
      return;
    }

    // Validate target and token inputs
    const sanitizedTarget = sanitize(targetAddress);
    const sanitizedToken = sanitize(tokenAddress);

    if (!sanitizedToken) {
      setStatus(Status.Error);
      setError("Invalid token address!");
      return;
    }

    if (!sanitizedTarget) {
      setStatus(Status.Error);
      setError("Invalid target!");
      return;
    }

    if (!bech32mValidation(bech32mPrefix, sanitizedTarget)) {
      setError("Invalid bech32m address for target!");
      setStatus(Status.Error);
      return;
    }

    if (!bech32mValidation(bech32mPrefix, sanitizedToken)) {
      setError("Invalid bech32m address for token address!");
      setStatus(Status.Error);
      return;
    }
    setStatus(Status.Pending);
    setStatusText(undefined);

    try {
      const { challenge, tag } = await requestChallenge(url).catch((e) => {
        throw new Error(`Error requesting challenge: ${e}`);
      });

      const solution = computePowSolution(challenge, difficulty || 0);

      if (!solution) {
        throw new Error("A solution was not computed!");
      }

      const submitData = {
        solution,
        tag,
        challenge,
        transfer: {
          target: sanitizedTarget,
          token: sanitizedToken,
          amount: amount * 1_000_000,
        },
      };

      const response = await requestTransfer(url, submitData).catch((e) => {
        console.info(e);
        const { code, message } = e;
        throw new Error(`Unable to request transfer: ${code} ${message}`);
      });

      if (response.sent) {
        // Reset form if successful
        setTargetAddress(undefined);
        setAmount(0);
        setError(undefined);
        setStatus(Status.Completed);
        setStatusText("Transfer succeeded!");
        setResponseDetails(response);
        return;
      }

      setStatus(Status.Completed);
      setStatusText("Transfer did not succeed.");
      console.info(response);
    } catch (e) {
      setError(`${e}`);
      setStatus(Status.Error);
    }
  }, [targetAddress, tokenAddress, amount]);

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  return (
    <FaucetFormContainer>
      {settingsError && <Alert type="error">{settingsError}</Alert>}
      <InputContainer>
        <Input
          label="Target Address"
          value={targetAddress}
          onFocus={handleFocus}
          onChange={(e) => setTargetAddress(e.target.value)}
        />
      </InputContainer>

      <InputContainer>
        <Input
          label="Token Address (defaults to NAM)"
          value={tokenAddress}
          onFocus={handleFocus}
          onChange={(e) => setTokenAddress(e.target.value)}
        />
      </InputContainer>

      <InputContainer>
        <AmountInput
          placeholder={`From 1 to ${limit}`}
          label="Amount"
          value={amount === undefined ? undefined : new BigNumber(amount)}
          min={0}
          maxDecimalPlaces={3}
          onFocus={handleFocus}
          onChange={(e) => setAmount(e.target.value?.toNumber())}
          error={
            amount && amount > limit
              ? `Amount must be less than or equal to ${limit}`
              : ""
          }
        />
      </InputContainer>

      {status !== Status.Error && (
        <FormStatus>
          {status === Status.Pending && (
            <Alert type="warning">Processing faucet transfer...</Alert>
          )}
          {status === Status.Completed && (
            <Alert type="info">{statusText}</Alert>
          )}

          {responseDetails && status !== Status.Pending && (
            <PreFormatted>
              {JSON.stringify(responseDetails, null, 2)}
            </PreFormatted>
          )}
        </FormStatus>
      )}
      {status === Status.Error && <Alert type="error">{error}</Alert>}

      <ButtonContainer>
        <ActionButton
          style={{
            fontSize: "1.25rem",
            lineHeight: "1.6",
            padding: "0.6em 2.5em",
            margin: 0,
          }}
          className={`max-w-fit ${!isFormValid && "opacity-50"}`}
          color="secondary"
          borderRadius="lg"
          onClick={handleSubmit}
          disabled={!isFormValid}
        >
          Get Testnet Tokens
        </ActionButton>
      </ButtonContainer>
    </FaucetFormContainer>
  );
};
