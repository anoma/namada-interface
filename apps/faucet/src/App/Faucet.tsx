import BigNumber from "bignumber.js";
import { sanitize } from "dompurify";
import React, { useCallback, useContext, useEffect, useState } from "react";

import {
  ActionButton,
  Alert,
  AmountInput,
  Input,
  Select,
} from "@namada/components";
import { Namada } from "@namada/integrations";
import { Account } from "@namada/types";
import { bech32mValidation, shortenAddress } from "@namada/utils";

import { TransferResponse, computePowSolution } from "../utils";
import { AppContext } from "./App";
import { InfoContainer } from "./App.components";
import {
  ButtonContainer,
  FaucetFormContainer,
  FormStatus,
  InputContainer,
  PreFormatted,
} from "./Faucet.components";

enum Status {
  Pending,
  Completed,
  Error,
}

type Props = {
  accounts: Account[];
  integration: Namada;
  isTestnetLive: boolean;
};

const bech32mPrefix = "tnam";

export const FaucetForm: React.FC<Props> = ({
  accounts,
  integration,
  isTestnetLive,
}) => {
  const { api, difficulty, settingsError, limit, tokens } =
    useContext(AppContext);

  const accountLookup = accounts.reduce(
    (acc, account) => {
      acc[account.address] = account;
      return acc;
    },
    {} as Record<string, Account>
  );
  const [account, setAccount] = useState<Account>(accounts[0]);
  const [tokenAddress, setTokenAddress] = useState<string>();
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState(Status.Completed);
  const [statusText, setStatusText] = useState<string>();
  const [responseDetails, setResponseDetails] = useState<TransferResponse>();

  const accountsSelectData = accounts.map(({ alias, address }) => ({
    label: `${alias} - ${shortenAddress(address)}`,
    value: address,
  }));

  useEffect(() => {
    if (tokens?.NAM) {
      setTokenAddress(tokens.NAM);
    }
  }, [tokens]);

  const isFormValid: boolean =
    Boolean(tokenAddress) &&
    Boolean(amount) &&
    (amount || 0) <= limit &&
    Boolean(account) &&
    status !== Status.Pending &&
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
    setStatus(Status.Pending);
    setStatusText(undefined);

    try {
      if (!account.publicKey) {
        throw new Error("Account does not have a public key!");
      }

      const { challenge, tag } = await api
        .challenge(account.publicKey)
        .catch(({ message, code }) => {
          throw new Error(`Unable to request challenge: ${code} - ${message}`);
        });

      const solution = computePowSolution(challenge, difficulty || 0);

      const signer = integration.signer();
      if (!signer) {
        throw new Error("signer not defined");
      }

      const sig = await signer.sign(account.address, challenge);
      if (!sig) {
        throw new Error("Signature was rejected");
      }

      const submitData = {
        solution,
        tag,
        challenge,
        player_id: account.publicKey,
        challenge_signature: sig.signature,
        transfer: {
          target: account.address,
          token: sanitizedToken,
          amount: amount * 1_000_000,
        },
      };

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

      setStatus(Status.Completed);
      setStatusText("Transfer did not succeed.");
      console.info(response);
    } catch (e) {
      setError(`${e}`);
      setStatus(Status.Error);
    }
  }, [account, tokenAddress, amount]);

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  return (
    <FaucetFormContainer>
      {settingsError && <Alert type="error">{settingsError}</Alert>}
      <InputContainer>
        {accounts.length > 0 ? (
          <Select
            data={accountsSelectData}
            value={account.address}
            label="Account"
            onChange={(e) => setAccount(accountLookup[e.target.value])}
          />
        ) : (
          <div>
            You have no signing accounts! Import or create an account in the
            extension, then reload this page.
          </div>
        )}
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
            <InfoContainer>
              <Alert type="warning">Processing faucet transfer...</Alert>
            </InfoContainer>
          )}
          {status === Status.Completed && (
            <InfoContainer>
              <Alert type="info">{statusText}</Alert>
            </InfoContainer>
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
