import { Panel } from "@namada/components";
import { ConnectBanner } from "App/Common/ConnectBanner";
import { ValidatorDiversification } from "App/Sidebars/ValidatorDiversification";
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

  useEffect(() => {
    if (isConnected && accounts.length > 0) {
      fetchMyValidators(accounts);
      fetchBalances();
    }
  }, [isConnected, accounts]);

  return (
    <div className="grid grid-cols-[auto_240px] gap-2">
      <div className="flex flex-col gap-1.5">
        {!isConnected && (
          <ConnectBanner text="To stake please connect your account" />
        )}
        {isConnected && <StakingSummary />}
        {isConnected && myValidators.length > 0 && (
          <Panel title="My Validators">
            <MyValidatorsTable />
          </Panel>
        )}
        <Panel title="All Validators">
          <AllValidatorsTable />
        </Panel>
      </div>
      <aside>
        <Panel>
          <ValidatorDiversification />
        </Panel>
      </aside>
    </div>
  );
};
