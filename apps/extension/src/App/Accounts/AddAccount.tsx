import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  ButtonVariant,
  Input,
  InputVariant,
  Toggle,
} from "@anoma/components";
import { AccountType, DerivedAccount } from "@anoma/types";
import { chains, defaultChainId } from "@anoma/chains";

import { ExtensionRequester } from "extension";
import { Ports } from "router";
import { DeriveAccountMsg } from "background/keyring";
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
  ShieldedToggleContainer,
} from "./AddAccount.components";
import { TopLevelRoute } from "App/types";
import { useAuth } from "hooks";

type Props = {
  // The parent Bip44 "account"
  parentAccount: number;
  accounts: DerivedAccount[];
  requester: ExtensionRequester;
  setAccounts: (accounts: DerivedAccount[]) => void;
};

const validateAccount = (
  account: number,
  newAccount: { change: number; index: number },
  accounts: DerivedAccount[],
  accountType: AccountType
): boolean => {
  const newPath = [account, newAccount.change, newAccount.index].join("/");
  let isValid = true;
  accounts
    .filter((derivedAccount) => derivedAccount.type === accountType)
    .forEach((derivedAccount: DerivedAccount) => {
      const {
        path: { account, change, index },
      } = derivedAccount;
      const existingPath = [account, change, index].join("/");

      if (newPath === existingPath) {
        isValid = false;
      }
    });

  return isValid;
};

const findNextIndex = (
  accounts: DerivedAccount[],
  accountType: AccountType
): number => {
  let maxIndex = 0;

  accounts
    .filter(
      (account) =>
        account.type !== AccountType.Mnemonic && account.type === accountType
    )
    .forEach((account) => {
      const { index = 0 } = account.path;
      maxIndex = index + 1;
    });

  return maxIndex;
};

enum Status {
  Idle,
  Pending,
  Failed,
}

const AddAccount: React.FC<Props> = ({
  parentAccount,
  accounts,
  requester,
  setAccounts,
}) => {
  const navigate = useNavigate();
  const [isLocked, setIsLocked] = useState(true);
  const [alias, setAlias] = useState("");
  const [change, setChange] = useState(0);
  const [bip44Error, setBip44Error] = useState("");
  const [isFormValid, setIsFormValid] = useState(true);
  const [formError, setFormError] = useState("");
  const [formStatus, setFormStatus] = useState(Status.Idle);
  const [isTransparent, setIsTransparent] = useState(true);
  const [index, setIndex] = useState(
    findNextIndex(
      accounts,
      isTransparent ? AccountType.PrivateKey : AccountType.ShieldedKeys
    )
  );

  const bip44Prefix = "m/44";
  const zip32Prefix = "m/32";
  const { coinType } = chains[defaultChainId].bip44;

  const authorize = useAuth(requester);

  useEffect(() => {
    authorize(
      TopLevelRoute.AddAccount,
      "A password is required to add an account!",
      () => setIsLocked(false)
    );
  }, []);

  useEffect(() => {
    const isValid = validateAccount(
      parentAccount,
      { change, index },
      accounts,
      isTransparent ? AccountType.PrivateKey : AccountType.ShieldedKeys
    );
    if (!isValid) {
      setBip44Error("Invalid path! This path is already in use.");
      setIsFormValid(false);
    } else {
      setBip44Error("");
      setIsFormValid(true);
    }
  }, [parentAccount, change, index]);

  useEffect(() => {
    setIndex(
      findNextIndex(
        accounts,
        isTransparent ? AccountType.PrivateKey : AccountType.ShieldedKeys
      )
    );
  }, [isTransparent]);

  const handleAccountAdd = async (): Promise<void> => {
    setFormStatus(Status.Pending);
    try {
      const derivedAccount: DerivedAccount =
        await requester.sendMessage<DeriveAccountMsg>(
          Ports.Background,
          new DeriveAccountMsg(
            {
              account: parentAccount,
              change,
              index,
            },
            isTransparent ? AccountType.PrivateKey : AccountType.ShieldedKeys,
            alias
          )
        );
      setAccounts([...accounts, derivedAccount]);
      navigate(TopLevelRoute.Accounts);
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
    const result = e.target.value.replace(/\D/g, "") || "0";
    callback(parseInt(result));
  };

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  const parentDerivationPath = isTransparent
    ? `${bip44Prefix}'/${coinType}'/${parentAccount}'/`
    : `${zip32Prefix}'/${coinType}'/${parentAccount}'/`;

  return (
    <AddAccountContainer>
      {!isLocked && (
        <>
          <AddAccountForm
            onKeyDown={(e) => {
              if (e.key === "Enter" && isFormValid) {
                handleAccountAdd();
              }
            }}
          >
            <InputContainer>
              <Input
                variant={InputVariant.Text}
                label="Alias"
                autoFocus={true}
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
              />
            </InputContainer>
            <InputContainer>
              <Label>
                <p>HD Derivation Path</p>
                <Bip44PathContainer>
                  <Bip44PathDelimiter>
                    {parentDerivationPath}
                  </Bip44PathDelimiter>
                  {isTransparent && (
                    <>
                      <Bip44Input
                        type="number"
                        min="0"
                        max="1"
                        value={change}
                        onChange={(e) => handleNumericChange(e, setChange)}
                        onFocus={handleFocus}
                      />
                      <Bip44PathDelimiter>/</Bip44PathDelimiter>
                    </>
                  )}
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
            <InputContainer>
              <ShieldedToggleContainer>
                <span>Transparent&nbsp;</span>
                <Toggle
                  onClick={() => setIsTransparent(!isTransparent)}
                  checked={isTransparent}
                />
                <span>&nbsp;Shielded</span>
              </ShieldedToggleContainer>
            </InputContainer>

            <Bip44Path>
              Derivation path:{" "}
              <span>{`${parentDerivationPath}${
                isTransparent ? `${change}/` : ""
              }${index}`}</span>
            </Bip44Path>
            <Bip44Error>{bip44Error}</Bip44Error>
          </AddAccountForm>
          {formStatus === Status.Pending && (
            <FormStatus>Submitting new account...</FormStatus>
          )}
          {formStatus === Status.Failed && <FormError>{formError}</FormError>}
          <ButtonsContainer>
            <Button
              variant={ButtonVariant.Contained}
              onClick={() => navigate(TopLevelRoute.Accounts)}
            >
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
        </>
      )}
    </AddAccountContainer>
  );
};

export default AddAccount;
