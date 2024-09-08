import BigNumber from "bignumber.js";
import { sanitize } from "dompurify";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActionButton,
  Alert,
  AmountInput,
  Input,
  Select,
} from "@namada/components";
import { Account } from "@namada/types";
import { bech32mValidation, shortenAddress } from "@namada/utils";

import { ChallengeResponse, Data, TransferResponse } from "../utils";
import { AppContext } from "./App";
import {
  ButtonContainer,
  InfoContainer,
  InputContainer,
} from "./App.components";
import {
  FaucetFormContainer,
  FormStatus,
  PreFormatted,
} from "./Faucet.components";

enum Status {
  PendingPowSolution,
  PendingTransfer,
  Completed,
  Error,
}

type Props = {
  accounts: Account[];
  isTestnetLive: boolean;
};

const bech32mPrefix = "tnam";

export const FaucetForm: React.FC<Props> = ({ accounts, isTestnetLive }) => {
  const {
    api,
    settings: { difficulty, tokens, withdrawLimit },
  } = useContext(AppContext)!;

  const accountLookup = accounts.reduce(
    (acc, account) => {
      acc[account.address] = account;
      return acc;
    },
    {} as Record<string, Account>
  );
  const [account, setAccount] = useState<Account>(accounts[0]);
  const [tokenAddress, setTokenAddress] = useState<string>();
  const [challengeResponse, setChallengeResponse] =
    useState<ChallengeResponse>();
  const [solution, setSolution] = useState<string>();
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState(Status.Completed);
  const [statusText, setStatusText] = useState<string>();
  const [responseDetails, setResponseDetails] = useState<TransferResponse>();

  const accountsSelectData = accounts.map(({ alias, address }) => ({
    label: `${alias} - ${shortenAddress(address)}`,
    value: address,
  }));

  const powSolver: Worker = useMemo(
    () => new Worker(new URL("../workers/powWorker.ts", import.meta.url)),
    []
  );

  useEffect(() => {
    if (tokens?.NAM) {
      setTokenAddress(tokens.NAM);
    }
  }, [tokens]);

  const isFormValid: boolean =
    Boolean(tokenAddress) &&
    Boolean(amount) &&
    (amount || 0) <= withdrawLimit &&
    Boolean(account) &&
    status !== Status.PendingPowSolution &&
    status !== Status.PendingTransfer &&
    typeof difficulty !== "undefined" &&
    isTestnetLive;

  const handleSubmit = useCallback(async () => {
    if (
      !account ||
      !amount ||
      !tokenAddress ||
      typeof difficulty === "undefined"
    ) {
      console.error("Please provide the required values!");
      return;
    }

    // Validate target and token inputs
    const sanitizedToken = sanitize(tokenAddress);

    if (!sanitizedToken) {
      setStatus(Status.Error);
      setError("Invalid token address!");
      return;
    }

    if (!account) {
      setStatus(Status.Error);
      setError("No account found!");
      return;
    }

    if (!bech32mValidation(bech32mPrefix, sanitizedToken)) {
      setError("Invalid bech32m address for token address!");
      setStatus(Status.Error);
      return;
    }
    setStatus(Status.PendingPowSolution);
    setStatusText(undefined);

    try {
      if (!account.publicKey) {
        throw new Error("Account does not have a public key!");
      }
      const { challenge, tag } = await api
        .challenge()
        .catch(({ message, code }) => {
          throw new Error(`Unable to request challenge: ${code} - ${message}`);
        });
      setChallengeResponse({ challenge, tag });
    } catch (e) {
      setError(`${e}`);
      setStatus(Status.Error);
    }
  }, [account, tokenAddress, amount]);

  useEffect(() => {
    if (challengeResponse) {
      const { challenge } = challengeResponse;
      // post message to worker to start POW computation
      powSolver.postMessage({ challenge, difficulty });
    }
  }, [challengeResponse]);

  useEffect(() => {
    // Listen for worker solution
    if (powSolver) {
      powSolver.onmessage = ({ data }) => {
        setSolution(data);
      };
    }
  }, [powSolver]);

  useEffect(() => {
    void (async () => {
      if (challengeResponse && solution && amount && tokenAddress) {
        const { tag, challenge } = challengeResponse;
        const submitData: Data = {
          solution,
          tag,
          challenge,
          transfer: {
            target: account.address,
            token: tokenAddress,
            amount: amount * 1_000_000,
          },
        };

        try {
          setStatus(Status.PendingTransfer);
          const response = await api.submitTransfer(submitData).catch((e) => {
            console.info(e);
            const { code, message } = e;
            throw new Error(`Unable to submit transfer: ${code} ${message}`);
          });

          if (response.sent) {
            // Reset form if successful
            setAmount(0);
            setError(undefined);
            setStatus(Status.Completed);
            setStatusText("Transfer succeeded!");
            setResponseDetails(response);
            return;
          }
          setSolution(undefined);
          setStatus(Status.Completed);
          setStatusText("Transfer did not succeed.");
          console.info(response);
        } catch (e) {
          setError(`${e}`);
          setStatus(Status.Error);
          setChallengeResponse(undefined);
          setSolution(undefined);
        }
      }
    })();
  }, [solution]);

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  return (
    <FaucetFormContainer>
      <InputContainer>
        {accounts.length > 0 ?
          <Select
            data={accountsSelectData}
            value={account.address}
            label="Account"
            onChange={(e) => setAccount(accountLookup[e.target.value])}
          />
          : <div>
            You have no signing accounts! Import or create an account in the
            extension, then reload this page.
          </div>
        }
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
          placeholder={`From 1 to ${withdrawLimit}`}
          label="Amount"
          value={amount === undefined ? undefined : new BigNumber(amount)}
          min={0}
          maxDecimalPlaces={3}
          onFocus={handleFocus}
          onChange={(e) => setAmount(e.target.value?.toNumber())}
          error={
            amount && amount > withdrawLimit ?
              `Amount must be less than or equal to ${withdrawLimit}`
              : ""
          }
        />
      </InputContainer>

      {status !== Status.Error && (
        <FormStatus>
          {status === Status.PendingPowSolution && (
            <InfoContainer>
              <Alert type="warning">Computing POW Solution...</Alert>
            </InfoContainer>
          )}
          {status === Status.PendingTransfer && (
            <InfoContainer>
              <Alert type="warning">Processing Faucet Transfer..</Alert>
            </InfoContainer>
          )}
          {status === Status.Completed && statusText && (
            <InfoContainer>
              <Alert type="info">{statusText}</Alert>
            </InfoContainer>
          )}

          {responseDetails &&
            status !== Status.PendingPowSolution &&
            status !== Status.PendingTransfer && (
              <PreFormatted>
                {JSON.stringify(responseDetails, null, 2)}
              </PreFormatted>
            )}
        </FormStatus>
      )}
      {status === Status.Error && <Alert type="error">{error}</Alert>}

      <ButtonContainer>
        <ActionButton
          backgroundHoverColor="yellow"
          textHoverColor="black"
          outlineColor="yellow"
          className={`max-w-fit ${!isFormValid && "opacity-50"}`}
          color="cyan"
          onClick={handleSubmit}
          disabled={!isFormValid}
        >
          Get Testnet Tokens
        </ActionButton>
      </ButtonContainer>
    </FaucetFormContainer>
  );
};
