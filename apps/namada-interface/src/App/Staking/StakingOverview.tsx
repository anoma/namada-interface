import { Panel } from "@namada/components";
import { ConnectBanner } from "App/Common/ConnectBanner";
import { ValidatorDiversification } from "App/Sidebars/ValidatorDiversification";
import { YourStakingDistribution } from "App/Sidebars/YourStakingDistribution";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { fetchBalancesAtom, transparentAccountsAtom } from "slices/accounts";
import { namadaExtensionConnectedAtom } from "slices/settings";
import { fetchMyValidatorsAtom, myValidatorsAtom } from "slices/validators";
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
  const fetchBalances = useSetAtom(fetchBalancesAtom);
  const fetchMyValidators = useSetAtom(fetchMyValidatorsAtom);
  const myValidators = useAtomValue(myValidatorsAtom);
  const hasStaking = isConnected && myValidators.length > 0;

  useEffect(() => {
    if (isConnected && accounts.length > 0) {
      fetchMyValidators(accounts);
      fetchBalances();
    }
  }, [isConnected, accounts]);

  return (
    <div className="grid grid-cols-[auto_270px] gap-2">
      <div className="flex flex-col gap-1.5">
        {!isConnected && (
          <ConnectBanner text="To stake please connect your account" />
        )}
        {isConnected && <StakingSummary />}
        {hasStaking && (
          <Panel title="My Validators">
            <MyValidatorsTable />
          </Panel>
        )}
        <Panel title="All Validators">
          <AllValidatorsTable />
        </Panel>
      </div>
      <aside className="flex flex-col gap-2">
        <Panel>
          {hasStaking && (
            <YourStakingDistribution
              myValidators={myValidators
                .concat(myValidators)
                .concat(myValidators)
                .concat(myValidators)
                .concat(myValidators)
                .concat(myValidators)}
            />
          )}
        </Panel>
        <Panel>
          <ValidatorDiversification />
        </Panel>
      </aside>
    </div>
  );
};
