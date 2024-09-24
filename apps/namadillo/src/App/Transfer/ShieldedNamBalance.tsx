import { ActionButton, AmountSummaryCard, Image } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { NamCurrency } from "App/Common/NamCurrency";
import { useBalances } from "hooks/useBalances";

export const ShieldedNamBalance = (): JSX.Element => {
  const { balanceQuery, isLoading, availableAmount } = useBalances();

  return (
    <AtomErrorBoundary
      result={balanceQuery}
      niceError="Unable to load available NAM balance"
    >
      <AmountSummaryCard
        logoElement={<Image imageName="LogoMinimal" />}
        title={
          <>
            Available NAM
            <br />
            to Stake
          </>
        }
        isLoading={isLoading}
        mainAmount={
          <NamCurrency
            amount={availableAmount ?? 0}
            className="block leading-none"
            currencySignClassName="block mb-3 mt-0.5 text-sm"
          />
        }
        callToAction={
          <ActionButton
            className="px-8"
            size="xs"
            backgroundColor="cyan"
            href="TODO"
          >
            Stake
          </ActionButton>
        }
      />
    </AtomErrorBoundary>
  );
};
