import { cleanup, render, screen } from "@testing-library/react";
import BigNumber from "bignumber.js";
import { mockUseBalances } from "hooks/__mocks__/mockUseBalance";
import { AtomWithQueryResult } from "jotai-tanstack-query";
import { NamBalanceContainer } from "../NamBalanceContainer";

jest.mock("hooks/useBalances", () => ({
  useBalances: jest.fn(),
}));

describe("Component: NamBalanceContainer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders error boundary when queries fail", () => {
    // Check if the error message from AtomErrorBoundary is displayed
    const execute = (
      balanceQueryError: boolean,
      stakeQueryError: boolean
    ): void => {
      mockUseBalances({
        balanceQuery: { isError: balanceQueryError } as AtomWithQueryResult,
        stakeQuery: { isError: stakeQueryError } as AtomWithQueryResult,
        isLoading: false,
        isSuccess: false,
      });
      render(<NamBalanceContainer />);
      expect(screen.getByText(/Unable to load balances/i)).toBeInTheDocument();
      cleanup();
      jest.clearAllMocks();
    };

    execute(true, true);
    execute(false, true);
    execute(true, false);
  });

  test("renders balance items when data is loaded", () => {
    mockUseBalances({
      availableAmount: new BigNumber(100),
      bondedAmount: new BigNumber(50),
      unbondedAmount: new BigNumber(30),
      withdrawableAmount: new BigNumber(25),
      totalAmount: new BigNumber(200),
    });

    render(<NamBalanceContainer />);

    // Check if the list items for each balance type are rendered
    expect(screen.getByText(/Available NAM/i)).toBeInTheDocument();
    expect(screen.getByText(/Staked NAM/i)).toBeInTheDocument();
    expect(screen.getByText(/Unbonded NAM/i)).toBeInTheDocument();

    // Check if the amounts are displayed correctly

    // Available:
    expect(screen.getByText("100 NAM")).toBeInTheDocument();

    // Bonded / Staked
    expect(screen.getByText("50 NAM")).toBeInTheDocument();

    // Unbonded + Withdraw
    expect(screen.queryByText("30 NAM")).toBeNull();
    expect(screen.queryByText("25 NAM")).toBeNull();
    expect(screen.getByText("55 NAM")).toBeInTheDocument();
  });
});
