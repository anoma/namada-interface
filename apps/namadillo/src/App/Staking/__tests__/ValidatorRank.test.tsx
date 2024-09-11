import "@testing-library/jest-dom"; // For matcher utilities
import { render, screen } from "@testing-library/react";
import { ValidatorRank } from "App/Staking/ValidatorRank";

describe("Component: ValidatorRank", () => {
  const rank = 99;

  const assertContentIsPresent = (): void => {
    expect(screen.getByText(`#${rank}`)).toBeInTheDocument();
  };

  const assertDashIsPresent = (): void => {
    expect(screen.getByText("—")).toBeInTheDocument();
  };

  test("displays rank when status is consensus", () => {
    render(<ValidatorRank rank={rank} status="consensus" />);
    assertContentIsPresent();
  });

  test("displays em dash when status is unknown", () => {
    render(<ValidatorRank rank={rank} status="unknown" />);
    assertDashIsPresent();
  });

  test("displays em dash when status is belowCapacity", () => {
    render(<ValidatorRank rank={rank} status="belowCapacity" />);
    assertDashIsPresent();
  });

  test("displays em dash when status is belowThreshold", () => {
    render(<ValidatorRank rank={rank} status="belowThreshold" />);
    assertDashIsPresent();
  });

  test("displays semi transparent number when status is inactive", () => {
    render(<ValidatorRank rank={rank} status="inactive" />);
    const rankElement = screen.getByText(`#${rank}`);
    expect(rankElement.className).toContain("opacity");
    assertContentIsPresent();
  });

  test("displays rank in red when status is jailed", () => {
    render(<ValidatorRank rank={rank} status="jailed" />);
    assertContentIsPresent();
    const rankElement = screen.getByText(`#${rank}`);
    expect(rankElement.className).toContain("fail");
    expect(screen.getByTitle("Jailed")).toBeInTheDocument();
  });
});
