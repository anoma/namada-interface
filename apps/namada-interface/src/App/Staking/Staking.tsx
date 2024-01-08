import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import BigNumber from "bignumber.js";

import { truncateInMiddle } from "@namada/utils";
import { Modal } from "@namada/components";
import { useSanitizedLocation } from "@namada/hooks";

import { MainContainerNavigation } from "App/StakingAndGovernance/MainContainerNavigation";
import { StakingContainer } from "./Staking.components";
import { StakingOverview } from "./StakingOverview";
import { ValidatorDetails } from "./ValidatorDetails";
import { TopLevelRoute, StakingAndGovernanceSubRoute } from "App/types";
import {
  Validator,
  StakingPosition,
  ChangeInStakingPosition,
} from "slices/StakingAndGovernance";
import { NewBondingPosition } from "./NewBondingPosition";
import { UnbondPosition } from "./UnbondPosition";
import { Account } from "slices/accounts";

const initialTitle = "Staking";

// this is just a placeholder in real case we can use the
// navigation callback that we define in this file and pass
// down for the table
const breadcrumbsFromPath = (path: string): string[] => {
  const pathInParts = path.split("/");
  const pathLength = pathInParts.length;

  if (
    `/${pathInParts[pathLength - 2]}` ===
    StakingAndGovernanceSubRoute.ValidatorDetails
  ) {
    return ["Staking", pathInParts[pathLength - 1]];
  }
  return ["Staking"];
};

const validatorNameFromUrl = (path: string): string | undefined => {
  const pathInParts = path.split("/");
  const pathLength = pathInParts.length;

  if (
    `/${pathInParts[pathLength - 2]}` ===
    StakingAndGovernanceSubRoute.ValidatorDetails
  ) {
    return pathInParts[pathLength - 1];
  }
};

const emptyStakingPosition = (validatorId: string): StakingPosition => ({
  uuid: validatorId,
  bonded: true,
  stakedAmount: new BigNumber(0),
  owner: "",
  totalRewards: "",
  validatorId: validatorId,
});

type Props = {
  accounts: Account[];
  validators: Validator[];
  myStakingPositions: StakingPosition[];
  selectedValidatorId: string | undefined;
  // will be called at first load, parent decides what happens
  onInitCallback: () => void;
  fetchValidatorDetails: (validatorId: string) => void;
  postNewBonding: (changeInStakingPosition: ChangeInStakingPosition) => void;
  postNewUnbonding: (changeInStakingPosition: ChangeInStakingPosition) => void;
};

// in this view we can be in one of these states at any given time
export enum ModalState {
  None,
  NewBonding,
  Unbond,
}

// TODO: these should go to Modal component
export enum ModalOnRequestCloseType {
  Confirm,
  Cancel,
}

//  This is the parent view for all staking related views. Most of the
//  staking specific functions are defined here and passed down as props.
//  This contains the main vies in staking:
//  * StakingOverview - displaying an overview of the users staking and validators
//  * ValidatorDetails - as the name says
//  * NewStakingStakingPosition - rendered in modal on top of other content
//     this is for creating new staking positions
//  * UnstakePositions - rendered in modal on top of other content, for unstaking
export const Staking = (props: Props): JSX.Element => {
  const [breadcrumb, setBreadcrumb] = useState([initialTitle]);
  const [modalState, setModalState] = useState(ModalState.None);
  const location = useSanitizedLocation();
  const navigate = useNavigate();

  const {
    accounts,
    onInitCallback,
    fetchValidatorDetails,
    postNewBonding,
    postNewUnbonding,
    validators,
    myStakingPositions,
    selectedValidatorId,
  } = props;

  // these 2 are needed for validator details
  const stakingPositionsWithSelectedValidator = myStakingPositions.filter(
    (validator) => validator.validatorId === selectedValidatorId
  );

  const selectedValidator = validators.find(
    (validator) => validator.uuid === selectedValidatorId
  );

  // this is just so we can se the title/breadcrumb
  // in real case we do this cleanly in a callback that
  // we define here
  const isStakingRoot =
    location.pathname ===
    `${TopLevelRoute.StakingAndGovernance}${StakingAndGovernanceSubRoute.Staking}`;

  // from outside this view we just navigate here
  // this view decides what is the default view
  useEffect(() => {
    if (isStakingRoot) {
      navigate(
        `${TopLevelRoute.StakingAndGovernance}${StakingAndGovernanceSubRoute.Staking}${StakingAndGovernanceSubRoute.StakingOverview}`
      );
    }
  });

  useEffect(() => {
    onInitCallback();
  }, []);

  useEffect(() => {
    const newBreadcrumb = breadcrumbsFromPath(location.pathname);
    const validatorName = validatorNameFromUrl(location.pathname);
    if (validatorName) {
      // triggers fetching of further details
      setBreadcrumb(newBreadcrumb);
    }
  }, [location.pathname, JSON.stringify(breadcrumb)]);

  const navigateToValidatorDetails = (validatorId: string): void => {
    navigate(
      `${TopLevelRoute.StakingAndGovernance}${StakingAndGovernanceSubRoute.Staking}${StakingAndGovernanceSubRoute.ValidatorDetails}/${validatorId}`
    );
    fetchValidatorDetails(validatorId);
  };

  const navigateToUnbonding = (validatorId: string, owner: string): void => {
    navigate(
      `${TopLevelRoute.StakingAndGovernance}${StakingAndGovernanceSubRoute.Staking}${StakingAndGovernanceSubRoute.ValidatorDetails}/${validatorId}/${owner}`
    );
  };

  // callbacks for the bonding and unbonding views
  const confirmBonding = (
    changeInStakingPosition: ChangeInStakingPosition
  ): void => {
    setModalState(ModalState.None);
    postNewBonding(changeInStakingPosition);
  };

  const cancelBonding = (): void => {
    setModalState(ModalState.None);
  };

  const confirmUnbonding = (
    changeInStakingPosition: ChangeInStakingPosition
  ): void => {
    setModalState(ModalState.None);
    postNewUnbonding(changeInStakingPosition);
  };

  const cancelUnbonding = (): void => {
    setModalState(ModalState.None);
    navigateToValidatorDetails(selectedValidatorId || "");
  };

  return (
    <StakingContainer>
      <MainContainerNavigation
        breadcrumbs={breadcrumb}
        navigateBack={() => {
          navigate(
            `${TopLevelRoute.StakingAndGovernance}${StakingAndGovernanceSubRoute.Staking}${StakingAndGovernanceSubRoute.StakingOverview}`
          );
          setBreadcrumb([initialTitle]);
        }}
      />
      {/* modal for bonding */}
      <Modal
        isOpen={modalState === ModalState.NewBonding}
        title={`Stake with ${truncateInMiddle(
          selectedValidator?.name || "",
          5,
          5
        )}`}
        onBackdropClick={() => {
          cancelBonding();
        }}
      >
        <NewBondingPosition
          accounts={accounts}
          confirmBonding={confirmBonding}
          cancelBonding={cancelBonding}
          currentBondingPositions={
            stakingPositionsWithSelectedValidator.length !== 0
              ? stakingPositionsWithSelectedValidator
              : [emptyStakingPosition(selectedValidatorId || "")]
          }
        />
      </Modal>

      <Routes>
        <Route
          path={StakingAndGovernanceSubRoute.StakingOverview}
          element={
            <StakingOverview
              navigateToValidatorDetails={navigateToValidatorDetails}
            />
          }
        />
        <Route
          path={`${StakingAndGovernanceSubRoute.ValidatorDetails}/:validatorId`}
          element={
            <ValidatorDetails
              validator={selectedValidator}
              stakingPositionsWithSelectedValidator={
                stakingPositionsWithSelectedValidator
              }
              navigateToUnbonding={navigateToUnbonding}
              setModalState={setModalState}
            />
          }
        >
          <Route
            path=":owner"
            element={
              <Modal
                isOpen={modalState === ModalState.Unbond}
                title="Unstake"
                onBackdropClick={cancelUnbonding}
              >
                <UnbondPosition
                  confirmUnbonding={confirmUnbonding}
                  cancelUnbonding={cancelUnbonding}
                  currentBondingPositions={
                    stakingPositionsWithSelectedValidator.length !== 0
                      ? stakingPositionsWithSelectedValidator
                      : [emptyStakingPosition(selectedValidatorId || "")]
                  }
                />
              </Modal>
            }
          />
        </Route>
      </Routes>
    </StakingContainer>
  );
};
