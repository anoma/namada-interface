import { render, screen } from "@testing-library/react";
import { ValidatorCard } from "App/Staking/ValidatorCard";
import { Validator } from "types";

const mockValidator: Partial<Validator> = {
  address: "tnam1xxxxxxxxxxyyyyyyy",
  alias: "Validator Name",
  imageUrl: "https://namada.net/image",
};

describe("Component: ValidatorCard", () => {
  it("renders validator alias and address by default", () => {
    render(<ValidatorCard validator={mockValidator as Validator} />);
    expect(screen.getByText(mockValidator.alias!)).toBeInTheDocument();
    expect(
      screen.queryAllByText("tnam1", { exact: false }).length
    ).toBeGreaterThan(0);
  });

  it("renders without the address when showAddress is false", () => {
    render(
      <ValidatorCard
        validator={mockValidator as Validator}
        showAddress={false}
      />
    );
    expect(screen.queryAllByText("tnam1", { exact: false })).toHaveLength(0);
  });

  it("renders the validator thumb with correct imageUrl", () => {
    render(<ValidatorCard validator={mockValidator as Validator} />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      mockValidator.imageUrl
    );
  });

  it("renders the validator thumb without complete data", () => {
    render(
      <ValidatorCard
        validator={
          {
            address: mockValidator.address!,
            alias: undefined,
            imageUrl: undefined,
          } as Validator
        }
      />
    );
    expect(
      screen.getAllByText("tnam1", { exact: false }).length
    ).toBeGreaterThan(0);
    expect(screen.queryByText(mockValidator.alias!)).not.toBeInTheDocument();
  });
});
