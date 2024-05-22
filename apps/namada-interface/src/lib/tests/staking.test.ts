import BigNumber from "bignumber.js";
import { getAmountDistribution } from "../staking";

describe("Testing lib/staking functions", () => {
  // We're assuming that increments is always equal decrements amount

  // Regular test case
  const reducedAmounts1 = {
    a: BigNumber(20),
    b: BigNumber(100),
  };

  const assignedAmounts1 = {
    c: BigNumber(25),
    d: BigNumber(95),
  };

  // Distributing to same validator
  const reducedAmounts2 = {
    a: BigNumber(20),
    b: BigNumber(100),
    c: BigNumber(20),
  };

  const assignedAmounts2 = {
    a: BigNumber(10),
    c: BigNumber(110),
    d: BigNumber(20),
  };

  // Zeoring an address
  const reducedAmounts3 = { a: BigNumber(100) };
  const assignedAmounts3 = { b: BigNumber(100) };

  it("should calculate the correct distribution", () => {
    // More than one distribution
    const distribution1 = getAmountDistribution(
      reducedAmounts1,
      assignedAmounts1
    );
    expect(distribution1[0].sourceValidator).toBe("b");
    expect(distribution1[0].destinationValidator).toBe("c");
    expect(distribution1[0].amount.toString()).toBe("25");

    expect(distribution1[1].sourceValidator).toBe("b");
    expect(distribution1[1].destinationValidator).toBe("d");
    expect(distribution1[1].amount.toString()).toBe("75");

    expect(distribution1[2].sourceValidator).toBe("a");
    expect(distribution1[2].destinationValidator).toBe("d");
    expect(distribution1[2].amount.toString()).toBe("20");

    // Distributing to the same validator because of reasons
    const distribution2 = getAmountDistribution(
      reducedAmounts2,
      assignedAmounts2
    );
    expect(distribution2.length).toBe(3);
    expect(distribution2[0].sourceValidator).toBe("b");
    expect(distribution2[0].destinationValidator).toBe("d");
    expect(distribution2[0].amount.toString()).toBe("20");
    expect(distribution2[1].sourceValidator).toBe("b");
    expect(distribution2[1].destinationValidator).toBe("c");
    expect(distribution2[1].amount.toString()).toBe("80");
    expect(distribution2[2].sourceValidator).toBe("a");
    expect(distribution2[2].destinationValidator).toBe("c");
    expect(distribution2[2].amount.toString()).toBe("10");

    // Only one distribution
    const distribution3 = getAmountDistribution(
      reducedAmounts3,
      assignedAmounts3
    );
    expect(distribution3[0].sourceValidator).toBe("a");
    expect(distribution3[0].destinationValidator).toBe("b");
    expect(distribution3[0].amount.toString()).toBe("100");
  });
});
