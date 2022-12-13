import { truncateInMiddle } from "@anoma/utils";
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { MainContainerNavigation } from "App/StakingAndGovernance/MainContainerNavigation";
import { Modal } from "components/Modal";
import { StakingContainer } from "./Staking.components";
import { StakingOverview } from "./StakingOverview";
import { ValidatorDetails } from "./ValidatorDetails";
import { TopLevelRoute, StakingAndGovernanceSubRoute } from "App/types";
import {
  Validator,
  MyValidators,
  StakingPosition,
  ChangeInStakingPosition,
} from "slices/StakingAndGovernance";
import { NewBondingPosition } from "./NewBondingPosition";
import { UnbondPosition } from "./UnbondPosition";
import { BalanceByToken } from "slices/balances";

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
  stakingStatus: "",
  stakedAmount: "",
  owner: "",
  totalRewards: "",
  validatorId: validatorId,
});

type Props = {
  balance: Record<string, BalanceByToken>;
  addresses: string[];
  validators: Validator[];
  myValidators: MyValidators[];
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
  const location = useLocation();
  const navigate = useNavigate();

  const {
    balance,
    addresses,
    onInitCallback,
    fetchValidatorDetails,
    postNewBonding,
    postNewUnbonding,
    validators,
    myValidators,
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
          balance={balance}
          addresses={addresses}
          confirmBonding={confirmBonding}
          cancelBonding={cancelBonding}
          currentBondingPositions={
            stakingPositionsWithSelectedValidator.length !== 0
              ? stakingPositionsWithSelectedValidator
              : [emptyStakingPosition(selectedValidatorId || "")]
          }
        />
      </Modal>

      {/* modal for unbonding */}
      <Modal
        isOpen={modalState === ModalState.Unbond}
        title="Unstake"
        onBackdropClick={() => {
          cancelUnbonding();
        }}
      >
        <UnbondPosition
          confirmUnbonding={confirmUnbonding}
          cancelUnbonding={cancelUnbonding}
          currentBondingPosition={
            stakingPositionsWithSelectedValidator[0] ||
            emptyStakingPosition(selectedValidatorId || "")
          }
        />
      </Modal>
      <Routes>
        <Route
          path={StakingAndGovernanceSubRoute.StakingOverview}
          element={
            <StakingOverview
              navigateToValidatorDetails={navigateToValidatorDetails}
              myValidators={myValidators}
              validators={validators}
              balance={balance}
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
