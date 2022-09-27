import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ButtonVariant, Input, InputVariants } from "@anoma/components";

import { ExtensionRequester } from "extension";
import { Ports } from "router";
import { DerivedAccount, DeriveAccountMsg } from "background/keyring";
import {
  AddAccountContainer,
  AddAccountForm,
  Bip44PathContainer,
  Bip44Input,
  Bip44Path,
  Bip44Error,
  FormError,
  FormStatus,
} from "./AddAccount.components";

type Props = {
  accounts: DerivedAccount[];
  requester: ExtensionRequester;
  setAccounts: (accounts: DerivedAccount[]) => void;
};

const validateAccount = (
  newAccount: { account: string; change: string; index: string },
  accounts: DerivedAccount[]
): boolean => {
  const newPath = [
    newAccount.account,
    newAccount.change,
    newAccount.index,
  ].join("/");
  let isValid = true;
  accounts.forEach((a: DerivedAccount) => {
    const { bip44Path } = a;
    const { account, change, index } = bip44Path;
    const existingPath = [account, change, index].join("/");

    if (newPath === existingPath) {
      isValid = false;
    }
  });

  return isValid;
};

const findNextIndex = (accounts: DerivedAccount[]): string => {
  let maxIndex = "0'";
  accounts.forEach((account) => {
    const { index } = account.bip44Path;
    const [prevIndex, prime = ""] = index.split("");
    if (parseInt(prevIndex) > parseInt(maxIndex.split("")[0])) {
      maxIndex = [prevIndex, prime].join("");
    }
  });

  const [index, prime = ""] = maxIndex.split("");
  const nextIndex = parseInt(index) + 1;

  return `${nextIndex}${prime}`;
};

enum Status {
  Pending,
  Failed,
}

const AddAccount: React.FC<Props> = ({ accounts, requester, setAccounts }) => {
  const navigate = useNavigate();
  const [alias, setAlias] = useState("");
  const [account, setAccount] = useState("0'");
  const [change, setChange] = useState("0'");
  const [index, setIndex] = useState(findNextIndex(accounts));
  const [bip44Error, setBip44Error] = useState("");
  const [isFormValid, setIsFormValid] = useState(true);
  const [formError, setFormError] = useState("");
  const [formStatus, setFormStatus] = useState<Status>();

  const bip44Prefix = "m/44'";

  useEffect(() => {
    const isValid = validateAccount({ account, change, index }, accounts);
    if (!isValid) {
      setBip44Error("Invalid path!");
      setIsFormValid(false);
    } else {
      setBip44Error("");
      setIsFormValid(true);
    }
  }, [account, change, index]);

  const handleAccountAdd = async () => {
    setFormStatus(Status.Pending);
    try {
      const derivedAccount: DerivedAccount =
        await requester.sendMessage<DeriveAccountMsg>(
          Ports.Background,
          new DeriveAccountMsg({ account, change, index })
        );
      setAccounts([...accounts, derivedAccount]);
      navigate(-1);
    } catch (e) {
      console.error(e);
      setFormStatus(Status.Failed);
      setFormError("An error occurred adding this account!");
    }
  };

  return (
    <AddAccountContainer>
      <AddAccountForm>
        <Input
          variant={InputVariants.Text}
          label="Alias"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
        />
        <Bip44PathContainer>
          <span>{bip44Prefix}</span>
          <Bip44Input
            variant={InputVariants.Text}
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          />
          <Bip44Input
            variant={InputVariants.Text}
            value={change}
            onChange={(e) => setChange(e.target.value)}
          />
          <Bip44Input
            variant={InputVariants.Text}
            value={index}
            onChange={(e) => setIndex(e.target.value)}
          />
        </Bip44PathContainer>
        <Bip44Path>{[bip44Prefix, account, change, index].join("/")}</Bip44Path>
        <Bip44Error>{bip44Error}</Bip44Error>
      </AddAccountForm>
      {formStatus === Status.Pending && (
        <FormStatus>Submitting new account...</FormStatus>
      )}
      {formStatus === Status.Failed && <FormError>{formError}</FormError>}
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
    </AddAccountContainer>
  );
};

export default AddAccount;
