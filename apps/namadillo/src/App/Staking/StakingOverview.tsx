import { Panel } from "@namada/components";
import { ConnectBanner } from "App/Common/ConnectBanner";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { EpochInformation } from "App/Sidebars/EpochInformation";
import { ValidatorDiversification } from "App/Sidebars/ValidatorDiversification";
import { YourStakingDistribution } from "App/Sidebars/YourStakingDistribution";
import { myValidatorsAtom } from "atoms/validators";
import { useUserHasAccount } from "hooks/useIsAuthenticated";
import { useAtomValue } from "jotai";
import { AllValidatorsTable } from "./AllValidatorsTable";
import { MyValidatorsTable } from "./MyValidatorsTable";
import { StakingSummary } from "./StakingSummary";
import { UnbondingAmountsTable } from "./UnbondingAmountsTable";

export const StakingOverview = (): JSX.Element => {
  const userHasAccount = useUserHasAccount();
  const myValidators = useAtomValue(myValidatorsAtom);
  const hasStaking = myValidators.data?.some((v) => v.stakedAmount?.gt(0));
  const hasUnbonded = myValidators.data?.some((v) => v.unbondedAmount?.gt(0));
  const hasWithdraws = myValidators.data?.some((v) =>
    v.withdrawableAmount?.gt(0)
  );

  return (
    <PageWithSidebar>
      <div className="flex flex-col gap-2">
        {!userHasAccount && <ConnectBanner actionText="To stake" />}
        {userHasAccount && <StakingSummary />}
        {hasStaking && (
          <Panel title="My Validators" className="relative grid">
            <MyValidatorsTable />
          </Panel>
        )}
        {(hasUnbonded || hasWithdraws) && (
          <Panel title="Unbonding" className="relative">
            <UnbondingAmountsTable />
          </Panel>
        )}
        <Panel className="relative pb-6 overflow-hidden" title="All Validators">
          <AllValidatorsTable />
        </Panel>
      </div>
      <aside className="w-full mt-2 flex flex-col sm:flex-row lg:mt-0 lg:flex-col gap-2">
        <EpochInformation />
        {hasStaking && myValidators.isSuccess && (
          <Panel className="w-full @container">
            <YourStakingDistribution myValidators={myValidators.data!} />
          </Panel>
        )}
        <Panel>
          <ValidatorDiversification />
        </Panel>
      </aside>
    </PageWithSidebar>
  );
};
