import { mockJotai, mockReactRouterDom } from "test-utils";
mockReactRouterDom("/");
mockJotai();

import { fireEvent, render, screen } from "@testing-library/react";
import StakingRoutes from "App/Staking/routes";
import { StakingRewardsPanel } from "App/Staking/StakingRewardsPanel";
import { applicationFeaturesAtom } from "atoms/settings";
import { claimableRewardsAtom } from "atoms/staking";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";

jest.mock("atoms/staking", () => ({
  claimableRewardsAtom: jest.fn(),
}));

// eslint-disable-next-line
const mockAtomValues = (claimRewardsEnabled: boolean, rewards: any) => {
  (useAtomValue as jest.Mock).mockImplementation((atom) => {
    if (atom === applicationFeaturesAtom) {
      return { claimRewardsEnabled };
    }
    if (atom === claimableRewardsAtom) {
      return { data: rewards };
    }
    return null;
  });
};

describe("Component: StakingRewardsPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setup = (): void => {
    render(<StakingRewardsPanel />);
  };

  const getClaimButton = (): HTMLElement =>
    screen.getByRole("button", { name: /Claim/i });

  it("renders the component with rewards disabled", () => {
    mockAtomValues(false, {});
    setup();
    expect(screen.getByText(/will be enabled/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Claim/i })).toBeDisabled();
  });

  it("renders the component with rewards disabled, even if user has rewards to be claimed", () => {
    mockAtomValues(false, {
      validator1: BigNumber(10),
      validato2: BigNumber(20),
    });
    setup();
    expect(screen.getByText(/will be enabled/i)).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Claim/i })).toBeDisabled();
  });

  it("renders with rewards enabled, but without anything to be claimed", () => {
    mockAtomValues(true, {});
    setup();
    expect(screen.getByText(/unclaimed/i)).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    const claimButton = getClaimButton();
    expect(claimButton).toBeDisabled();
  });

  it("renders with rewards to be claimed", () => {
    mockAtomValues(true, {
      validator1: BigNumber(10),
      validator2: BigNumber(20),
    });

    const mockNavigate = jest.fn();
    jest
      .spyOn(require("react-router-dom"), "useNavigate")
      .mockReturnValue(mockNavigate);

    setup();
    expect(screen.getByText(/unclaimed/i)).toBeInTheDocument();
    const claimButton = getClaimButton();
    expect(claimButton).not.toBeDisabled();
    fireEvent.click(claimButton);
    expect(mockNavigate).toHaveBeenCalledWith(
      StakingRoutes.claimRewards().url,
      {
        state: { backgroundLocation: { pathname: "/" } },
      }
    );
  });
});
