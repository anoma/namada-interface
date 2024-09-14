import BigNumber from "bignumber.js";
import { mockJotai } from "test-utils";
mockJotai();

import { fireEvent, render, screen } from "@testing-library/react";
import { StakingRewards } from "App/Staking/StakingRewards";
import { defaultAccountAtom } from "atoms/accounts";
import { applicationFeaturesAtom } from "atoms/settings";
import { claimableRewardsAtom } from "atoms/staking";
import { useTransaction } from "hooks/useTransaction";
import { useAtomValue } from "jotai";
import { AddressBalance } from "types";

jest.mock("hooks/useTransaction", () => ({
  useTransaction: jest.fn(),
}));

jest.mock("hooks/useModalCloseEvent", () => ({
  useModalCloseEvent: () => ({ onCloseModal: jest.fn() }),
}));

jest.mock("atoms/staking", () => ({
  claimableRewardsAtom: jest.fn(),
  claimAndStakeRewardsAtom: jest.fn(),
  claimRewardsAtom: jest.fn(),
}));

const mockAtomValue = (
  data: AddressBalance = {},
  isLoading: boolean = true,
  isSuccess: boolean = false,
  rewardsEnabled: boolean = true
): void => {
  (useAtomValue as jest.Mock).mockImplementation((atom) => {
    if (atom === defaultAccountAtom) {
      return { data: { address: "tnam1_test_account" } };
    }

    if (atom === claimableRewardsAtom) {
      return { data, isLoading, isSuccess };
    }

    if (atom === applicationFeaturesAtom) {
      return { claimRewardsEnabled: rewardsEnabled };
    }

    return null;
  });
};

const mockTransaction = (
  execute: jest.Mock = jest.fn(),
  isEnabled: boolean = false,
  isPending: boolean = false
): void => {
  (useTransaction as jest.Mock).mockImplementation(() => {
    return {
      execute,
      isEnabled,
      isPending,
    };
  });
};

describe("Component: StakingRewards", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const setup = (): void => {
    render(<StakingRewards />);
  };

  const getButtons = (): HTMLElement[] => {
    return screen.getAllByRole("button");
  };

  it("should render modal correctly", () => {
    mockAtomValue();
    mockTransaction();
    setup();
    expect(screen.getByText("Claimable Staking Rewards")).toBeInTheDocument();
    expect(getButtons()).toHaveLength(2);
  });

  it("should render loading skeleton when rewards are loading", () => {
    mockAtomValue({}, true);
    mockTransaction();
    render(<StakingRewards />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    const buttons = getButtons();
    buttons.forEach((button) => expect(button).toBeDisabled());
  });

  it("should display zero rewards and disabled buttons when no rewards available", () => {
    mockAtomValue({}, false, true);
    mockTransaction(jest.fn(), true, false);
    render(<StakingRewards />);
    expect(screen.getByText("0")).toBeInTheDocument();

    const buttons = getButtons();
    buttons.forEach((button) => expect(button).toBeDisabled());
  });

  it("should display available rewards when loaded", () => {
    mockAtomValue(
      {
        validator1: new BigNumber(100),
        validator2: new BigNumber(200),
      },
      false,
      true
    );
    mockTransaction();
    render(<StakingRewards />);
    expect(screen.getByText("300")).toBeInTheDocument();
  });

  it("should enable buttons if claim rewards are available", () => {
    mockAtomValue(
      {
        validator1: new BigNumber(100),
      },
      false,
      true
    );
    mockTransaction(jest.fn(), true, false);
    render(<StakingRewards />);
    const buttons = getButtons();
    buttons.forEach((button) => expect(button).toBeEnabled());
  });

  it("should disable buttons if claim rewards are not enabled", () => {
    mockAtomValue(
      {
        validator1: new BigNumber(100),
      },
      false,
      true,
      false
    );
    mockTransaction(jest.fn(), false, false);
    render(<StakingRewards />);
    const buttons = getButtons();
    buttons.forEach((button) => expect(button).not.toBeEnabled());
  });

  it("should disable buttons while transaction is pending", () => {
    mockAtomValue(
      {
        validator1: new BigNumber(100),
      },
      false,
      true
    );
    mockTransaction(jest.fn(), true, true);
    render(<StakingRewards />);
    const buttons = getButtons();
    buttons.forEach((button) => expect(button).not.toBeEnabled());
  });

  it("should call 'claimRewardsAndStake' when 'Claim & Stake' is clicked", async () => {
    const executeMock = jest.fn();
    mockTransaction(executeMock, true, false);
    mockAtomValue(
      {
        validator1: new BigNumber(100),
      },
      false,
      true
    );
    render(<StakingRewards />);
    const buttons = getButtons();
    fireEvent.click(buttons[0]);
    expect(executeMock).toHaveBeenCalledTimes(1);
    fireEvent.click(buttons[1]);
    expect(executeMock).toHaveBeenCalledTimes(2);
  });
});
