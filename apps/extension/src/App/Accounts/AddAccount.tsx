import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ButtonVariant, Input, InputVariants } from "@anoma/components";

import { ExtensionRequester } from "extension";
import { Ports } from "router";
import {
  DerivedAccount,
  DeriveAccountMsg,
  KeyStoreType,
} from "background/keyring";
import {
  AddAccountContainer,
  AddAccountForm,
  Bip44PathContainer,
  Bip44PathDelimiter,
  Bip44Input,
  Bip44Path,
  Bip44Error,
  ButtonsContainer,
  FormError,
  FormStatus,
  InputContainer,
  Label,
} from "./AddAccount.components";

type Props = {
  accounts: DerivedAccount[];
  requester: ExtensionRequester;
  setAccounts: (accounts: DerivedAccount[]) => void;
};

const validateAccount = (
  newAccount: { account: number; change: number; index: number },
  accounts: DerivedAccount[]
): boolean => {
  const newPath = [
    newAccount.account,
    newAccount.change,
    newAccount.index,
  ].join("/");
  let isValid = true;
  accounts.forEach((a: DerivedAccount) => {
    const { path } = a;
    const { account, change, index } = path;
    const existingPath = [account, change, index].join("/");

    if (newPath === existingPath) {
      isValid = false;
    }
  });

  return isValid;
};

const findNextIndex = (accounts: DerivedAccount[]): number => {
  let maxIndex = 0;

  accounts
    .filter((account) => account.type !== KeyStoreType.Mnemonic)
    .forEach((account) => {
      const { index = 0 } = account.path;
      maxIndex = index + 1;
    });

  return maxIndex;
};

enum Status {
  Pending,
  Failed,
}

const AddAccount: React.FC<Props> = ({ accounts, requester, setAccounts }) => {
  const navigate = useNavigate();
  const [alias, setAlias] = useState("");
  const [account, setAccount] = useState(0);
  const [change, setChange] = useState(0);
  const [index, setIndex] = useState(findNextIndex(accounts));
  const [bip44Error, setBip44Error] = useState("");
  const [isFormValid, setIsFormValid] = useState(true);
  const [formError, setFormError] = useState("");
  const [formStatus, setFormStatus] = useState<Status>();

  const bip44Prefix = "m/44'";
  const coinType = "0'";

  useEffect(() => {
    const isValid = validateAccount({ account, change, index }, accounts);
    if (!isValid) {
      setBip44Error("Invalid path! This path is already in use.");
      setIsFormValid(false);
    } else {
      setBip44Error("");
      setIsFormValid(true);
    }
  }, [account, change, index]);

  const handleAccountAdd = async (): Promise<void> => {
    setFormStatus(Status.Pending);
    try {
      const derivedAccount: DerivedAccount =
        await requester.sendMessage<DeriveAccountMsg>(
          Ports.Background,
          new DeriveAccountMsg({ account, change, index }, alias)
        );
      setAccounts([...accounts, derivedAccount]);
      navigate(-1);
    } catch (e) {
      console.error(e);
      setFormStatus(Status.Failed);
      setFormError("An error occurred adding this account!");
    }
  };

  const handleNumericChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (value: number) => void
  ): void => {
    const result = e.target.value || "0";
    callback(parseInt(result, 10));
  };

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>) =>
    e.target.select();

  return (
    <AddAccountContainer>
      <AddAccountForm>
        <InputContainer>
          <Input
            variant={InputVariants.Text}
            label="Alias"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
          />
        </InputContainer>

        <InputContainer>
          <Label>
            <p>HD Derivation Path</p>
            <Bip44PathContainer>
              <Bip44PathDelimiter>
                {[bip44Prefix, coinType].join("/")}/
              </Bip44PathDelimiter>
              <Bip44Input
                type="number"
                min="0"
                value={account}
                onChange={(e) => handleNumericChange(e, setAccount)}
                onFocus={handleFocus}
              />
              <Bip44PathDelimiter>'/</Bip44PathDelimiter>
              <Bip44Input
                type="number"
                min="0"
                value={change}
                onChange={(e) => handleNumericChange(e, setChange)}
                onFocus={handleFocus}
              />
              <Bip44PathDelimiter>/</Bip44PathDelimiter>
              <Bip44Input
                type="number"
                min="0"
                value={index}
                onChange={(e) => handleNumericChange(e, setIndex)}
                onFocus={handleFocus}
              />
            </Bip44PathContainer>
          </Label>
        </InputContainer>

        <Bip44Path>
          Derivation path:{" "}
          <span>
            {[bip44Prefix, coinType, `${account}'`, change, index].join("/")}
          </span>
        </Bip44Path>
        <Bip44Error>{bip44Error}</Bip44Error>
      </AddAccountForm>
      {formStatus === Status.Pending && (
        <FormStatus>Submitting new account...</FormStatus>
      )}
      {formStatus === Status.Failed && <FormError>{formError}</FormError>}
      <ButtonsContainer>
        <Button variant={ButtonVariant.Contained} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button
          variant={ButtonVariant.Contained}
          disabled={!isFormValid || formStatus === Status.Pending}
          onClick={handleAccountAdd}
        >
          Add
        </Button>
      </ButtonsContainer>
    </AddAccountContainer>
  );
};

export default AddAccount;
