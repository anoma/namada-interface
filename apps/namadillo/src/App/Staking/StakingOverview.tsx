import { Panel } from "@namada/components";
import { ConnectBanner } from "App/Common/ConnectBanner";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { ValidatorDiversification } from "App/Sidebars/ValidatorDiversification";
import { YourStakingDistribution } from "App/Sidebars/YourStakingDistribution";
import { namadaExtensionConnectedAtom } from "atoms/settings";
import { myValidatorsAtom } from "atoms/validators";
import { useUserHasAccount } from "hooks/useUserHasAccount";
import { useAtomValue } from "jotai";
import { AllValidatorsTable } from "./AllValidatorsTable";
import { MyValidatorsTable } from "./MyValidatorsTable";
import { StakingSummary } from "./StakingSummary";
import { UnbondingAmountsTable } from "./UnbondingAmountsTable";

export const StakingOverview = (): JSX.Element => {
  const hasAccount = useUserHasAccount();
  const isConnected = useAtomValue(namadaExtensionConnectedAtom);
  const myValidators = useAtomValue(myValidatorsAtom);
  const hasStaking = myValidators.data?.some((v) => v.stakedAmount?.gt(0));
  const hasUnbonded = myValidators.data?.some((v) => v.unbondedAmount?.gt(0));
  const hasWithdraws = myValidators.data?.some((v) =>
    v.withdrawableAmount?.gt(0)
  );

  return (
    <PageWithSidebar>
      <div className="flex flex-col gap-2">
        {!isConnected && (
          <ConnectBanner text="To stake please connect your account" />
        )}
        {isConnected && hasAccount === false && (
          <ConnectBanner text="To stake please create or import an account using Namada keychain" />
        )}
        {isConnected && hasAccount && <StakingSummary />}
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
        <Panel className="relative pb-6" title="All Validators">
          <AllValidatorsTable />
        </Panel>
      </div>
      <aside className="w-full mt-2 flex flex-col sm:flex-row lg:mt-0 lg:flex-col gap-2">
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
