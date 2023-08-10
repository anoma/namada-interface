import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  ButtonVariant,
  Input,
  InputVariants,
  Toggle,
} from "@namada/components";
import { AccountType, DerivedAccount } from "@namada/types";
import { chains, defaultChainId } from "@namada/chains";
import { makeBip44Path } from "@namada/utils";
import { LedgerError } from "@namada/ledger-namada";

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
import { AddLedgerAccountMsg, Ledger } from "background/ledger";

type Props = {
  accounts: DerivedAccount[];
  parentAccount: DerivedAccount;
  requester: ExtensionRequester;
  setAccounts: (accounts: DerivedAccount[]) => void;
  isLocked: boolean;
  unlockKeyRing: () => void;
};

const validatePath = (
  parentAccountIndex: number,
  newAccount: { change: number; index: number },
  accounts: DerivedAccount[],
  accountType: AccountType
): boolean => {
  const newPath = [
    parentAccountIndex,
    newAccount.change,
    newAccount.index,
  ].join("/");

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
 * @returns {boolean} retursn true when alias is valid
 */
const validateAliasIsRequired = (alias: string): boolean => {
  return alias !== "";
};

const findNextIndex = (
  accounts: DerivedAccount[],
  accountType: AccountType
): number => {
  let maxIndex = 0;

  accounts
    .filter((account) => account.type === accountType)
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
  AliasRequired = "Alias is required!",
}

const AddAccount: React.FC<Props> = ({
  accounts,
  parentAccount,
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
  const {
    id: parentId,
    type: parentAccountType,
    path: { account: parentAccountIndex },
  } = parentAccount;

  const getChildAccountType = (
    parentAccountType: AccountType,
    isTransparent: boolean
  ): AccountType => {
    if (parentAccountType === AccountType.Ledger) {
      return parentAccountType;
    }
    return isTransparent ? AccountType.PrivateKey : AccountType.ShieldedKeys;
  };

  const [index, setIndex] = useState(
    findNextIndex(
      accounts,
      getChildAccountType(parentAccountType, isTransparent)
    )
  );

  const bip44Prefix = "m/44";
  const zip32Prefix = "m/32";
  const { coinType } = chains[defaultChainId].bip44;

  const authorize = useAuth(requester);

  useEffect(() => {
    if (parentAccountType === AccountType.Mnemonic) {
      authorize(
        TopLevelRoute.AddAccount,
        `A password for "${parentAccount.alias}" is required to add an account!`,
        unlockKeyRing
      );
    }
  }, []);

  useEffect(() => {
    const _validatePath = validatePath.bind(
      null,
      parentAccountIndex,
      { change, index },
      accounts,
      parentAccountType
    );
    if (!_validatePath()) {
      setValidation(Validation.PathInUse);
    } else {
      setValidation(Validation.Valid);
    }
  }, [parentAccountIndex, change, index, isTransparent]);

  useEffect(() => {
    setIndex(
      findNextIndex(
        accounts,
        getChildAccountType(parentAccountType, isTransparent)
      )
    );
  }, [accounts, parentAccountType, isTransparent]);

  const validateAlias = (accounts: DerivedAccount[], alias: string): void => {
    const _validateAliasInUse = validateAliasInUse.bind(null, accounts, alias);
    const _validateAliasIsRequired = validateAliasIsRequired.bind(null, alias);

    if (!_validateAliasIsRequired()) {
      setValidation(Validation.AliasRequired);
    } else if (!_validateAliasInUse()) {
      setValidation(Validation.AliasInUse);
    } else {
      setValidation(Validation.Valid);
    }
  };

  const addLedgerAccount = async (): Promise<DerivedAccount | void> => {
    setFormStatus(Status.Pending);

    const bip44Path = {
      account: parentAccount.path.account,
      change,
      index,
    };
    const bip44PathString = makeBip44Path(
      chains[defaultChainId].bip44.coinType,
      bip44Path
    );

    const ledger = await Ledger.init().catch((e) => {
      setFormError(`${e}`);
      setFormStatus(Status.Failed);
    });

    if (!ledger) {
      return;
    }

    try {
      const {
        version: { errorMessage, returnCode },
      } = await ledger.status();

      if (returnCode !== LedgerError.NoErrors) {
        throw new Error(errorMessage);
      }

      const { address, publicKey } = await ledger.getAddressAndPublicKey(
        bip44PathString
      );

      return await requester.sendMessage(
        Ports.Background,
        new AddLedgerAccountMsg(alias, address, parentId, publicKey, bip44Path)
      );
    } catch (e) {
      setFormError(`${e}`);
      setFormStatus(Status.Failed);
    } finally {
      await ledger.closeTransport();
    }
  };

  const addPrivateKeyAccount = async (): Promise<DerivedAccount> => {
    setFormStatus(Status.Pending);
    return await requester.sendMessage<DeriveAccountMsg>(
      Ports.Background,
      new DeriveAccountMsg(
        {
          account: parentAccountIndex,
          change,
          index,
        },
        isTransparent ? AccountType.PrivateKey : AccountType.ShieldedKeys,
        alias
      )
    );
  };

  const handleAccountAdd = useCallback(async (): Promise<void> => {
    try {
      const derivedAccount =
        parentAccountType === AccountType.Ledger
          ? await addLedgerAccount()
          : await addPrivateKeyAccount();
      if (derivedAccount) {
        setAccounts([...accounts, derivedAccount]);
        navigate(TopLevelRoute.Accounts);
      }
    } catch (e) {
      console.error(e);
      setFormStatus(Status.Failed);
      setFormError("An error occurred adding this account!");
    }
  }, [accounts, alias, change, index]);

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
    ? `${bip44Prefix}'/${coinType}'/${parentAccountIndex}'/`
    : `${zip32Prefix}'/${coinType}'/${parentAccountIndex}'/`;

  return (
    <AddAccountContainer>
      {!(parentAccountType === AccountType.Mnemonic && isLocked) && (
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
                onChangeCallback={(e) => {
                  const { value } = e.target;
                  setAlias(value);
                  validateAlias(accounts, value);
                }}
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
            {parentAccountType !== AccountType.Ledger && (
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
            )}

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
              disabled={
                !isFormValid || formStatus === Status.Pending || alias === ""
              }
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
