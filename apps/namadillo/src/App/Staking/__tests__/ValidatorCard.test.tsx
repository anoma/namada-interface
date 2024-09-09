import { RenderResult, screen } from "@testing-library/react";
import { ValidatorCard, ValidatorCardProps } from "App/Staking/ValidatorCard";
import { render } from "test-utils";
import { Validator } from "types";

const mockValidator: Partial<Validator> = {
  address: "tnam1xxxxxxxxxxyyyyyyy",
  alias: "Validator Name",
  imageUrl: "https://namada.net/image",
  status: "consensus",
};

describe("Component: ValidatorCard", () => {
  const setup = (props: Partial<ValidatorCardProps> = {}): RenderResult => {
    return render(
      <ValidatorCard validator={{ ...mockValidator } as Validator} {...props} />
    );
  };

  it("renders validator alias and address by default", () => {
    setup();
    expect(screen.getByText(mockValidator.alias!)).toBeInTheDocument();
    expect(
      screen.queryAllByText("tnam1", { exact: false }).length
    ).toBeGreaterThan(0);
  });

  it("renders without the address when showAddress is false", () => {
    setup({ showAddress: false });
    expect(screen.queryAllByText("tnam1", { exact: false })).toHaveLength(0);
  });

  it("renders the validator thumb with correct imageUrl", () => {
    setup();
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      mockValidator.imageUrl
    );
  });

  it("renders the validator thumb without complete data", () => {
    setup({
      validator: {
        address: mockValidator.address!,
        alias: undefined,
        imageUrl: undefined,
      } as Validator,
    });
    expect(
      screen.getAllByText("tnam1", { exact: false }).length
    ).toBeGreaterThan(0);
    expect(screen.queryByText(mockValidator.alias!)).not.toBeInTheDocument();
  });

  it("should render my validator with some opacity when inactive", () => {
    const { container } = setup({
      validator: {
        ...mockValidator,
        status: "inactive",
      } as Validator,
    });
    expect(container.firstElementChild?.className || "").toContain("opacity");
  });
});
