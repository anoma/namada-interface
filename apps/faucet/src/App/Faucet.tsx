import React, { useCallback, useState } from "react";
import { sanitize } from "dompurify";
import { bech32m } from "bech32";
import {
  Button,
  ButtonVariant,
  Input,
  InputVariants,
  Select,
} from "@namada/components";

import {
  ButtonContainer,
  FaucetFormContainer,
  FormError,
  FormStatus,
  InputContainer,
  PreFormatted,
} from "./Faucet.components";
import { TokenData } from "config";
import {
  TransferResponse,
  computePowSolution,
  requestChallenge,
  requestTransfer,
} from "utils";

const DEFAULT_URL = "http://127.0.0.1:5000";
const DEFAULT_ENDPOINT = "/api/v1/faucet";
const DEFAULT_FAUCET_LIMIT = "1000";

const {
  REACT_APP_FAUCET_API_URL: faucetApiUrl = DEFAULT_URL,
  REACT_APP_FAUCET_API_ENDPOINT: faucetApiEndpoint = DEFAULT_ENDPOINT,
  REACT_APP_FAUCET_LIMIT: faucetLimit = DEFAULT_FAUCET_LIMIT,
  REACT_APP_PROXY: isProxied,
  REACT_APP_PROXY_PORT: proxyPort = 9000,
} = process.env;

const apiUrl = isProxied ? `http://127.0.0.1:${proxyPort}/proxy` : faucetApiUrl;

enum Status {
  Pending,
  Completed,
  Error,
}

export const FaucetForm: React.FC = () => {
  const [targetAddress, setTargetAddress] = useState<string>();
  const [tokenAddress, setTokenAddress] = useState(TokenData[0].value);
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState(Status.Completed);
  const [statusText, setStatusText] = useState<string>();
  const [responseDetails, setResponseDetails] = useState<TransferResponse>();

  const handleSubmit = useCallback(async () => {
    if (!targetAddress) {
      return;
    }

    // Validate target input
    const sanitizedTarget = sanitize(targetAddress);

    if (!sanitizedTarget) {
      setStatus(Status.Error);
      setError("Invalid target!");
      return;
    }

    try {
      bech32m.decode(sanitizedTarget);
    } catch (e) {
      setError("Invalid bech32 address!");
      setStatus(Status.Error);
      return;
    }

    setStatus(Status.Pending);
    setStatusText(undefined);

    const url = `${apiUrl}${faucetApiEndpoint}`;

    try {
      const { challenge, tag } = await requestChallenge(url).catch((e) => {
        throw new Error(`Error requesting challenge: ${e}`);
      });

      const difficulty = 2;
      const solution = computePowSolution(challenge, difficulty);

      if (!solution) {
        throw new Error("A solution was not computed!");
      }

      const submitData = {
        solution,
        tag,
        challenge,
        transfer: {
          target: sanitizedTarget,
          token: tokenAddress,
          amount: amount * 1_000_000,
        },
      };

      const response = await requestTransfer(url, submitData).catch(
        (e: unknown) => {
          throw new Error(`Error requesting transfer: ${e}`);
        }
      );

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
      <InputContainer>
        <Input
          variant={InputVariants.Text}
          label="Target Address"
          value={targetAddress}
          onChangeCallback={(e) => setTargetAddress(e.target.value)}
        />
      </InputContainer>

      <InputContainer>
        <Select
          label="Token"
          data={TokenData}
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
        />
      </InputContainer>

      <InputContainer>
        <Input
          variant={InputVariants.Number}
          label="Amount"
          value={amount}
          min={0}
          step={0.001}
          onFocus={handleFocus}
          onChangeCallback={(e) => {
            const { value } = e.target;
            if (value && /^\d*(\.\d{0,3})?$/.test(value)) {
              return setAmount(parseFloat(value));
            }
          }}
          error={
            amount > parseInt(faucetLimit)
              ? `Amount must be less than or equal to ${faucetLimit}`
              : ""
          }
        />
      </InputContainer>

      {status !== Status.Error && (
        <FormStatus>
          {status === Status.Pending && "Processing faucet transfer..."}
          {status === Status.Completed && statusText}

          {responseDetails && status !== Status.Pending && (
            <PreFormatted>
              {JSON.stringify(responseDetails, null, 2)}
            </PreFormatted>
          )}
        </FormStatus>
      )}
      {status === Status.Error && <FormError>{error}</FormError>}

      <ButtonContainer>
        <Button
          variant={ButtonVariant.Contained}
          onClick={handleSubmit}
          disabled={
            amount === 0 ||
            amount > parseInt(faucetLimit) ||
            !targetAddress ||
            status === Status.Pending
          }
        >
          Get Testnet Tokens
        </Button>
      </ButtonContainer>
    </FaucetFormContainer>
  );
};
