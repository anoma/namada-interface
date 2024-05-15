import { Panel } from "@namada/components";
import { ConnectBanner } from "App/Common/ConnectBanner";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { ValidatorDiversification } from "App/Sidebars/ValidatorDiversification";
import { YourStakingDistribution } from "App/Sidebars/YourStakingDistribution";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { balancesAtom, transparentAccountsAtom } from "slices/accounts";
import { namadaExtensionConnectedAtom } from "slices/settings";
import { myValidatorsAtom } from "slices/validators";
import { AllValidatorsTable } from "./AllValidatorsTable";
import { MyValidatorsTable } from "./MyValidatorsTable";
import { StakingSummary } from "./StakingSummary";

// callbacks in this type are specific to a certain row type
export type ValidatorsCallbacks = {
  onClickValidator: (validatorId: string) => void;
};

// This is the default view for the staking. it displays all the relevant
// staking information of the user and allows unstake the active staking
// positions directly from here.
// * Unstaking happens by calling a callback that triggers a modal
//   view in the parent
// * user can also navigate to sibling view for validator details
export const StakingOverview = (): JSX.Element => {
  const isConnected = useAtomValue(namadaExtensionConnectedAtom);
  const accounts = useAtomValue(transparentAccountsAtom);
  const myValidators = useAtomValue(myValidatorsAtom);
  const hasStaking = isConnected && myValidators.data?.length > 0;
  useAtomValue(balancesAtom);

  useEffect(() => {
    if (isConnected && accounts.length > 0) {
      myValidators.refetch();
    }
  }, [isConnected, accounts]);

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
        <Panel className="relative pb-6" title="All Validators">
          <AllValidatorsTable />
        </Panel>
      </div>
      <aside className="flex flex-col gap-2">
        {hasStaking && (
          <Panel>
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
