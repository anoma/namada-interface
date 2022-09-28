import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { MainContainerNavigation } from "App/StakingAndGovernance/MainContainerNavigation";
import { Modal } from "components/Modal";
import { StakingContainer } from "./Staking.components";
import { StakingOverview } from "./StakingOverview";
import { ValidatorDetails } from "./ValidatorDetails";
import { TopLevelRoute, StakingAndGovernanceSubRoute } from "App/types";
import {
  MyBalanceEntry,
  Validator,
  MyValidators,
  StakingPosition,
  ChangeInStakingPosition,
} from "slices/StakingAndGovernance";
import { NewStakingPosition } from "./NewStakingPosition";
import { UnstakePosition } from "./UnstakePosition";

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

type Props = {
  myBalances: MyBalanceEntry[];
  validators: Validator[];
  myValidators: MyValidators[];
  myStakingPositions: StakingPosition[];
  selectedValidatorId: string | undefined;
  onInitCallback: () => void; // will be called at first load, triggers fetching
  fetchValidatorDetails: (validatorId: string) => void;
  postNewStakingCallback: (
    changeInStakingPosition: ChangeInStakingPosition
  ) => void;
  postUnstakingCallback: (stakingPositionId: string) => void;
};

// in this view we can be in one of these states at any given time
export enum ModalState {
  None,
  Stake,
  Unstake,
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
  const location = useLocation();
  const navigate = useNavigate();

  const {
    onInitCallback,
    fetchValidatorDetails,
    postNewStakingCallback,
    postUnstakingCallback,
    myBalances,
    validators,
    myValidators,
    myStakingPositions,
    selectedValidatorId,
  } = props;

  // these 2 are needed for validator details
  const stakingPositionsWithSelectedValidator =
    myStakingPositions &&
    myStakingPositions.filter(
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
  }, [location, JSON.stringify(breadcrumb)]);

  const navigateToValidatorDetails = (validatorId: string): void => {
    navigate(
      `${TopLevelRoute.StakingAndGovernance}${StakingAndGovernanceSubRoute.Staking}${StakingAndGovernanceSubRoute.ValidatorDetails}/${validatorId}`
    );
    fetchValidatorDetails(validatorId);
  };

  // callbacks for the bonding and unbonding views
  const confirmBonding = (
    changeInStakingPosition: ChangeInStakingPosition
  ): void => {
    setModalState(ModalState.None);
    postNewStakingCallback(changeInStakingPosition);
  };

  const cancelBonding = (): void => {
    setModalState(ModalState.None);
  };

  const confirmUnbonding = (
    changeInStakingPosition: ChangeInStakingPosition
  ): void => {
    setModalState(ModalState.None);
    postNewStakingCallback(changeInStakingPosition);
  };

  const cancelUnbonding = (): void => {
    setModalState(ModalState.None);
    postUnstakingCallback("aaa");
  };

  const onRequestCloseUnstakingModal = (
    modalOnRequestCloseType: ModalOnRequestCloseType
  ): void => {
    switch (modalOnRequestCloseType) {
      case ModalOnRequestCloseType.Confirm: {
        if (selectedValidator) {
          // based on the current design we can never stake unless we have
          // selected a validator
          postUnstakingCallback("some_staking_position_id");
        }
        setModalState(ModalState.None);
        break;
      }
      case ModalOnRequestCloseType.Cancel: {
        setModalState(ModalState.None);
        break;
      }
    }
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
      <Modal
        isOpen={modalState === ModalState.Stake}
        title={`Stake with ${selectedValidator?.name}`}
        onBackdropClick={() => {
          cancelBonding();
        }}
      >
        <NewStakingPosition
          confirmStaking={confirmBonding}
          cancelStaking={cancelBonding}
        />
      </Modal>
      <Modal
        isOpen={modalState === ModalState.Unstake}
        title="Unstake"
        onBackdropClick={() => {
          onRequestCloseUnstakingModal(ModalOnRequestCloseType.Cancel);
        }}
      >
        <UnstakePosition
          confirmUnbonding={confirmUnbonding}
          cancelUnbonding={cancelUnbonding}
          currentBondingPosition={stakingPositionsWithSelectedValidator[0]}
        />
      </Modal>
      <Routes>
        <Route
          path={StakingAndGovernanceSubRoute.StakingOverview}
          element={
            <StakingOverview
              navigateToValidatorDetails={navigateToValidatorDetails}
              myBalances={myBalances}
              myValidators={myValidators}
              validators={validators}
            />
          }
        />
        <Route
          path={`${StakingAndGovernanceSubRoute.ValidatorDetails}/*`}
          element={
            <ValidatorDetails
              validator={selectedValidator}
              stakingPositionsWithSelectedValidator={
                stakingPositionsWithSelectedValidator
              }
              setModalState={setModalState}
            />
          }
        />
      </Routes>
    </StakingContainer>
  );
};
