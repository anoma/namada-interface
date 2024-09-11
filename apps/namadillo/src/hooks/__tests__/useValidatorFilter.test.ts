import { renderHook } from "@testing-library/react";
import {
  satisfiesSearchFilter,
  satisfiesValidatorFilter,
  useValidatorFilter,
  useValidatorFilterProps,
} from "hooks/useValidatorFilter";
import { Validator } from "types";

describe("Hook: useValidatorFilter", () => {
  const mockValidators: Partial<Validator>[] = [
    { address: "tnam1validator1", alias: "Validator One", status: "consensus" },
    {
      address: "tnam1validator2",
      alias: "Validator Two",
      status: "belowCapacity",
    },
    { address: "tnam1validator3", alias: undefined, status: "inactive" },
    {
      address: "tnam1validator4",
      alias: "Validator Four",
      status: "belowThreshold",
    },
  ];

  const myValidatorsAddresses = ["tnam1validator1", "tnam1validator3"];

  test("should apply search filters correctly", () => {
    const check = satisfiesSearchFilter.bind(
      null,
      mockValidators[0] as Validator
    );
    expect(check("validator1")).toBeTruthy();
    expect(check("")).toBeTruthy();
    expect(check("validator2")).toBeFalsy();
  });

  test("should check validator filter correctly", () => {
    const checkConsensus = satisfiesValidatorFilter.bind(
      null,
      mockValidators[0] as Validator
    );
    expect(checkConsensus("all")).toBeTruthy();
    expect(checkConsensus("active")).toBeTruthy();
    expect(checkConsensus("consensus")).toBeTruthy();
    expect(checkConsensus("inactive")).toBeFalsy();

    const checkBelowCapacity = satisfiesValidatorFilter.bind(
      null,
      mockValidators[1] as Validator
    );
    expect(checkBelowCapacity("all")).toBeTruthy();
    expect(checkBelowCapacity("active")).toBeTruthy();
    expect(checkBelowCapacity("belowCapacity")).toBeTruthy();
    expect(checkBelowCapacity("inactive")).toBeFalsy();

    const checkBelowThreshold = satisfiesValidatorFilter.bind(
      null,
      mockValidators[3] as Validator
    );
    expect(checkBelowThreshold("all")).toBeTruthy();
    expect(checkBelowThreshold("active")).toBeTruthy();
    expect(checkBelowThreshold("belowThreshold")).toBeTruthy();
    expect(checkBelowThreshold("inactive")).toBeFalsy();

    const checkInactive = satisfiesValidatorFilter.bind(
      null,
      mockValidators[2] as Validator
    );
    expect(checkInactive("all")).toBeTruthy();
    expect(checkInactive("active")).toBeFalsy();
    expect(checkInactive("inactive")).toBeTruthy();
  });

  test("should return the correct filtered list", () => {
    const initialProps: useValidatorFilterProps = {
      validators: mockValidators as Validator[],
      myValidatorsAddresses,
      searchTerm: "",
      onlyMyValidators: false,
      validatorFilter: "all",
    };

    // All validators
    const { result, rerender } = renderHook(useValidatorFilter, {
      initialProps: {
        ...initialProps,
      },
    });
    expect(result.current).toHaveLength(mockValidators.length);

    // Only my validators
    rerender({ ...initialProps, onlyMyValidators: true });
    expect(result.current).toHaveLength(myValidatorsAddresses.length);

    // My active validators (only validator1)
    rerender({
      ...initialProps,
      onlyMyValidators: true,
      validatorFilter: "active",
    });
    expect(result.current).toHaveLength(1);

    // My jailed validators = empty list
    rerender({
      ...initialProps,
      onlyMyValidators: true,
      validatorFilter: "jailed",
    });
    expect(result.current).toHaveLength(0);
  });
});
