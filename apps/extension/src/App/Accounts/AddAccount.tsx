import { LedgerError } from "@zondax/ledger-namada";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { chains } from "@namada/chains";
import { ActionButton, Input, Toggle } from "@namada/components";
import { makeBip44Path } from "@namada/sdk/web";
import { AccountType, DerivedAccount } from "@namada/types";

import { TopLevelRoute } from "App/types";
import { AddLedgerAccountMsg, DeriveAccountMsg } from "background/keyring";
import { Ledger } from "background/ledger";
import { ExtensionRequester } from "extension";
import { useAuth } from "hooks";
import { isKeyChainLocked, redirectToLogin } from "hooks/useAuth";
import { Ports } from "router";

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
 * @returns {boolean} returns true when alias is valid
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
      const { index } = account.path;
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
  const { coinType } = chains.namada.bip44;

  const authorize = useAuth(requester);

  useEffect(() => {
    if (parentAccountType === AccountType.Mnemonic) {
      void authorize(
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

  const addLedgerAccount = async (): Promise<DerivedAccount | false | void> => {
    setFormStatus(Status.Pending);

    const bip44Path = {
      account: parentAccount.path.account,
      change,
      index,
    };
    const bip44PathString = makeBip44Path(
      chains.namada.bip44.coinType,
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

      const { address, publicKey } =
        await ledger.getAddressAndPublicKey(bip44PathString);

      // TODO: provide a password for ledger
      return await requester.sendMessage(
        Ports.Background,
        new AddLedgerAccountMsg(alias, address, publicKey, bip44Path, parentId)
      );
    } catch (e) {
      setFormError(`${e}`);
      setFormStatus(Status.Failed);
    } finally {
      await ledger.closeTransport();
    }
  };

  const addPrivateKeyAccount = async (): Promise<
    DerivedAccount | undefined
  > => {
    const isLocked = await isKeyChainLocked(requester);

    if (isLocked) {
      redirectToLogin(
        navigate,
        TopLevelRoute.AddAccount,
        `Session timed out! A password for "${parentAccount.alias}" is required!`
      );
      return;
    }

    setFormStatus(Status.Pending);
    return await requester
      .sendMessage<DeriveAccountMsg>(
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
      )
      .catch((e) => {
        throw new Error(`Requester error: ${e}`);
      });
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
    <div className="flex flex-col w-full px-3">
      {!(parentAccountType === AccountType.Mnemonic && isLocked) && (
        <>
          <div
            className="mb-2 [&_input]:w-[92%]"
            onKeyDown={async (e) => {
              if (e.key === "Enter" && isFormValid) {
                await handleAccountAdd();
              }
            }}
          >
            <div className="my-3">
              <Input
                label="Alias"
                autoFocus={true}
                value={alias}
                onChange={(e) => {
                  const { value } = e.target;
                  setAlias(value);
                  validateAlias(accounts, value);
                }}
              />
            </div>

            <div className="my-3">
              <label className="text-base font-medium text-neutral-300">
                <p>HD Derivation Path</p>
                <div className="flex w-full justify-start items-center">
                  <span className="h-px px-1 text-xs text-neutral-300">
                    {parentDerivationPath}
                  </span>

                  {isTransparent && (
                    <>
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        value={change}
                        onChange={(e) => handleNumericChange(e, setChange)}
                        onFocus={handleFocus}
                      />
                      <i>/</i>
                    </>
                  )}

                  <Input
                    type="number"
                    min="0"
                    value={index}
                    onChange={(e) => handleNumericChange(e, setIndex)}
                    onFocus={handleFocus}
                  />
                </div>
              </label>
            </div>

            {parentAccountType !== AccountType.Ledger && (
              <div className="my-3">
                <div className="flex justify-end items-center pt-1 w-full">
                  <span>Transparent&nbsp;</span>
                  <Toggle
                    onClick={() => setIsTransparent(!isTransparent)}
                    checked={isTransparent}
                  />
                  <span>&nbsp;Shielded</span>
                </div>
              </div>
            )}

            <div className="text-sm text-neutral-400">
              Derivation path:{" "}
              <span>{`${parentDerivationPath}${
                isTransparent ? `${change}/` : ""
              }${index}`}</span>
            </div>

            <div className="text-xs py-1 text-red-500">{validation}</div>
          </div>

          {formStatus === Status.Pending && (
            <div className="text-sm pb-2 text-white">
              Submitting new account...
            </div>
          )}

          {formStatus === Status.Failed && (
            <div className="text-xs mb-2 text-red-500">{formError}</div>
          )}

          <div className="flex [&_button]:flex-1">
            <ActionButton onClick={() => navigate(TopLevelRoute.Accounts)}>
              Back
            </ActionButton>
            <ActionButton
              disabled={
                !isFormValid || formStatus === Status.Pending || alias === ""
              }
              onClick={handleAccountAdd}
            >
              Add
            </ActionButton>
          </div>
        </>
      )}
    </div>
  );
};

export default AddAccount;
