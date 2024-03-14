import BigNumber from "bignumber.js";
import {
  getAmountDistribution,
  getIncrementedAmounts,
  getReducedAmounts,
} from "../staking";

describe("Testing lib/staking functions", () => {
  // We're assuming that increments is always equal decrements amount

  // Regular test case
  const staked1 = {
    a: BigNumber(100),
    b: BigNumber(100),
    d: BigNumber(100),
  };

  const updatedAmounts1 = {
    a: BigNumber(90),
    b: BigNumber(50),
    c: BigNumber(25),
    d: BigNumber(135),
  };

  // Empty test case
  const staked2 = {};
  const updatedAmounts2 = {};

  // Zeoring an address
  const staked3 = { a: BigNumber(100) };
  const updatedAmounts3 = { a: BigNumber(0), b: BigNumber(100) };

  it("should get reduced amounts correctly", () => {
    const reducedAmounts1 = getReducedAmounts(staked1, updatedAmounts1);
    expect(reducedAmounts1.a.toString()).toBe("10");
    expect(reducedAmounts1.b.toString()).toBe("50");
    expect(reducedAmounts1.c).toBeUndefined();
    expect(reducedAmounts1.d).toBeUndefined();

    const reducedAmounts2 = getReducedAmounts(staked2, updatedAmounts2);
    expect(Object.keys(reducedAmounts2).length).toBe(0);

    const reducedAmounts3 = getReducedAmounts(staked3, updatedAmounts3);
    expect(reducedAmounts3.a.toString()).toBe("100");
    expect(reducedAmounts3.b).toBeUndefined();
  });

  it("should get incremented amounts correctly", () => {
    const incremented1 = getIncrementedAmounts(staked1, updatedAmounts1);
    expect(incremented1.a).toBeUndefined();
    expect(incremented1.b).toBeUndefined();
    expect(incremented1.c.toString()).toBe("25");
    expect(incremented1.d.toString()).toBe("35");

    // Empty test case
    const incrementedAmounts2 = getIncrementedAmounts(staked2, updatedAmounts2);
    expect(Object.keys(incrementedAmounts2).length).toBe(0);

    // Zeoring an address
    const reducedAmounts3 = getIncrementedAmounts(staked3, updatedAmounts3);
    expect(reducedAmounts3.a).toBeUndefined();
    expect(reducedAmounts3.b.toString()).toBe("100");
  });

  it("should calculate the correct distribution", () => {
    // More than one distribution
    const reducedAmounts1 = getReducedAmounts(staked1, updatedAmounts1);
    const incrementedAmounts1 = getIncrementedAmounts(staked1, updatedAmounts1);
    const distribution1 = getAmountDistribution(
      reducedAmounts1,
      incrementedAmounts1
    );
    expect(distribution1[0].sourceValidator).toBe("a");
    expect(distribution1[0].destinationValidator).toBe("c");
    expect(distribution1[0].amount.toString()).toBe("10");

    expect(distribution1[1].sourceValidator).toBe("b");
    expect(distribution1[1].destinationValidator).toBe("c");
    expect(distribution1[1].amount.toString()).toBe("15");

    expect(distribution1[2].sourceValidator).toBe("b");
    expect(distribution1[2].destinationValidator).toBe("d");
    expect(distribution1[2].amount.toString()).toBe("35");

    // Only one distribution
    const reducedAmounts3 = getReducedAmounts(staked3, updatedAmounts3);
    const incrementedAmounts3 = getIncrementedAmounts(staked3, updatedAmounts3);
    const distribution3 = getAmountDistribution(
      reducedAmounts3,
      incrementedAmounts3
    );
    expect(distribution3[0].sourceValidator).toBe("a");
    expect(distribution3[0].destinationValidator).toBe("b");
    expect(distribution3[0].amount.toString()).toBe("100");
  });
});
