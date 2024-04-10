import { Panel } from "@namada/components";
import ConnectBanner from "App/Common/ConnectBanner/ConnectBanner";
import { ValidatorDiversification } from "App/Sidebars/ValidatorDiversification";
import { useAtomValue } from "jotai";
import { namadaExtensionConnectedAtom } from "slices/settings";
import { AllValidatorsTable } from "./AllValidatorsTable";
import { MyValidatorsTable } from "./MyValidatorsTable";
import { StakingBalancesList } from "./StakingBalancesList";

// callbacks in this type are specific to a certain row type
export type ValidatorsCallbacks = {
  onClickValidator: (validatorId: string) => void;
};

type Props = {
  navigateToValidatorDetails: (validatorId: string) => void;
};

// This is the default view for the staking. it displays all the relevant
// staking information of the user and allows unstake the active staking
// positions directly from here.
// * Unstaking happens by calling a callback that triggers a modal
//   view in the parent
// * user can also navigate to sibling view for validator details
export const StakingOverview = (props: Props): JSX.Element => {
  const { navigateToValidatorDetails } = props;
  const isConnected = useAtomValue(namadaExtensionConnectedAtom);

  return (
    <div className="grid grid-cols-[auto_240px] gap-2">
      <div className="flex flex-col gap-1.5">
        {!isConnected && (
          <ConnectBanner text="To stake please connect your account" />
        )}
        {isConnected && (
          <>
            <StakingBalancesList />
            <MyValidatorsTable
              navigateToValidatorDetails={navigateToValidatorDetails}
            />
          </>
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
