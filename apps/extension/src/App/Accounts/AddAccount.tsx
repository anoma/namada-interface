import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  ButtonVariant,
  Input,
  InputVariants,
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
  Bip44Input,
  Bip44Path,
  Bip44PathContainer,
  Bip44PathDelimiter,
  ButtonsContainer,
  FormError,
  FormStatus,
  FormValidationMsg,
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
  isLocked: boolean;
  unlockKeyRing: () => void;
};

const validatePath = (
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

/**
 * Validates if alias is already in use
 *
 * @param {DerivedAccount[]} accounts - list of all the accounts
 * @param {string} alias - alias of the new address
 * @returns {boolean} returns true when alias is valid
 */
const validateAliasInUse = (
  accounts: DerivedAccount[],
  alias: string
): boolean => {
  return accounts.map((acc) => acc.alias).includes(alias) === false;
};

/**
 * Validates if alias is required
 *
 * @param {string} alias - alias of the new address
 * @param {boolean} isTransparent - is new address a transparent one
 * @returns {boolean} retursn true when alias is valid
 */
const validateAliasIsRequired = (
  alias: string,
  isTransparent: boolean
): boolean => {
  return !(!isTransparent && alias === "");
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

enum Validation {
  Valid = "",
  PathInUse = "Invalid path! This path is already in use.",
  AliasInUse = "This alias is already in use.",
  AliasRequired = "Alias is required for shielded addresses.",
}

const AddAccount: React.FC<Props> = ({
  parentAccount,
  accounts,
  requester,
  setAccounts,
  isLocked,
  unlockKeyRing,
}) => {
  const navigate = useNavigate();
  const [alias, setAlias] = useState("");
  const [change, setChange] = useState(0);
  const [validation, setValidation] = useState(Validation.Valid);
  const isFormValid = validation === Validation.Valid;
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
      unlockKeyRing
    );
  }, []);

  useEffect(() => {
    const _validatePath = validatePath.bind(
      null,
      parentAccount,
      { change, index },
      accounts,
      isTransparent ? AccountType.PrivateKey : AccountType.ShieldedKeys
    );
    const _validateAliasInUse = validateAliasInUse.bind(null, accounts, alias);
    const _validateAliasIsRequired = validateAliasIsRequired.bind(
      null,
      alias,
      isTransparent
    );

    if (!_validateAliasIsRequired()) {
      setValidation(Validation.AliasRequired);
    } else if (!_validateAliasInUse()) {
      setValidation(Validation.AliasInUse);
    } else if (!_validatePath()) {
      setValidation(Validation.PathInUse);
    } else {
      setValidation(Validation.Valid);
    }
  }, [parentAccount, change, index, alias, isTransparent]);

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
                variant={InputVariants.Text}
                label="Alias"
                autoFocus={true}
                value={alias}
                onChangeCallback={(e) => setAlias(e.target.value)}
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
            <FormValidationMsg>{validation}</FormValidationMsg>
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
