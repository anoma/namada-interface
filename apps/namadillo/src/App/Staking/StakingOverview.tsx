import { Panel } from "@namada/components";
import { ConnectBanner } from "App/Common/ConnectBanner";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { ValidatorDiversification } from "App/Sidebars/ValidatorDiversification";
import { YourStakingDistribution } from "App/Sidebars/YourStakingDistribution";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { defaultAccountAtom } from "slices/accounts";
import { namadaExtensionConnectedAtom } from "slices/settings";
import {
  myValidatorsAtom,
  stakedAmountByAddressAtom,
  unbondedAmountByAddressAtom,
} from "slices/validators";
import { AllValidatorsTable } from "./AllValidatorsTable";
import { MyValidatorsTable } from "./MyValidatorsTable";
import { StakingSummary } from "./StakingSummary";
import { UnbondingAmountsTable } from "./UnbondingAmountsTable";

// This is the default view for the staking. it displays all the relevant
// staking information of the user and allows unstake the active staking
// positions directly from here.
// * Unstaking happens by calling a callback that triggers a modal
//   view in the parent
// * user can also navigate to sibling view for validator details
export const StakingOverview = (): JSX.Element => {
  const isConnected = useAtomValue(namadaExtensionConnectedAtom);
  const { data: account } = useAtomValue(defaultAccountAtom);
  const myValidators = useAtomValue(myValidatorsAtom);
  const unbondedAmounts = useAtomValue(unbondedAmountByAddressAtom);
  const stakedByAddress = useAtomValue(stakedAmountByAddressAtom);
  const hasStaking =
    stakedByAddress.isSuccess && Object.keys(stakedByAddress.data).length > 0;
  const hasUnbonded =
    unbondedAmounts.isSuccess && Object.keys(unbondedAmounts.data).length > 0;

  useEffect(() => {
    if (isConnected && account) {
      myValidators.refetch();
    }
  }, [isConnected, account]);

  return (
    <PageWithSidebar>
      <div className="flex flex-col gap-2">
        {!isConnected && (
          <ConnectBanner text="To stake please connect your account" />
        )}
        {isConnected && <StakingSummary />}
        {hasStaking && (
          <Panel title="My Validators" className="relative">
            <MyValidatorsTable />
          </Panel>
        )}
        {hasUnbonded && (
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
            <YourStakingDistribution myValidators={myValidators.data} />
          </Panel>
        )}
        <Panel>
          <ValidatorDiversification />
        </Panel>
      </aside>
    </PageWithSidebar>
  );
};
