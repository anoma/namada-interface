import { useNavigate } from "react-router-dom";

import { ActionButton, Heading, Stack } from "@namada/components";
import { useUntilIntegrationAttached } from "@namada/integrations";
import { Chain, TokenType, Tokens } from "@namada/types";
import { TopLevelRoute } from "App/types";
import { AccountsState } from "slices/accounts";
import { useAppSelector } from "store";
import {
  HeadingContainer,
  TotalAmount,
  TotalAmountFiat,
  TotalAmountValue,
  TotalContainer,
  TotalHeading,
} from "./AccountOverview.components";
import { DerivedAccounts } from "./DerivedAccounts";

import { Intro } from "App/Common/Intro/Intro";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { balancesAtom } from "slices/accounts";

//TODO: move to utils when we have one
const isEmptyObject = (object: Record<string, unknown>): boolean => {
  return object ? Object.keys(object).length === 0 : true;
};

export const AccountOverview = (): JSX.Element => {
  const navigate = useNavigate();
  const chain = useAppSelector<Chain>((state) => state.chain.config);

  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);

  const extensionAttachStatus = useUntilIntegrationAttached(chain);
  const currentExtensionAttachStatus =
    extensionAttachStatus[chain.extension.id];

  const balances = useAtomValue(balancesAtom);
  const totalNativeBalance = Object.values(balances).reduce((acc, balance) => {
    return acc.plus(
      balance[chain.currency.symbol as TokenType] || BigNumber(0)
    );
  }, BigNumber(0));

  const hasExtensionInstalled =
    currentExtensionAttachStatus === "attached" ||
    currentExtensionAttachStatus === "pending";

  return (
    <>
      {!isEmptyObject(derived[chain.id]) && (
        <>
          <HeadingContainer>
            <div>
              <TotalHeading>
                <Heading level="h2">Wallet</Heading>
              </TotalHeading>
            </div>
            <TotalContainer>
              <TotalAmount>
                <TotalAmountFiat>
                  {Tokens[chain.currency.symbol as TokenType].symbol}
                </TotalAmountFiat>
                <TotalAmountValue>
                  {totalNativeBalance.toString()}
                </TotalAmountValue>
              </TotalAmount>
            </TotalContainer>
          </HeadingContainer>
          <Stack direction="horizontal" gap={8}>
            <ActionButton onClick={() => navigate(TopLevelRoute.TokenSend)}>
              Send
            </ActionButton>
            <ActionButton onClick={() => navigate(TopLevelRoute.TokenReceive)}>
              Receive
            </ActionButton>
          </Stack>
          <DerivedAccounts />
        </>
      )}
      {isEmptyObject(derived[chain.id]) && (
        <div className="w-[380px] mx-auto flex items-center">
          <Intro chain={chain} hasExtensionInstalled={hasExtensionInstalled} />
        </div>
      )}
    </>
  );
};
