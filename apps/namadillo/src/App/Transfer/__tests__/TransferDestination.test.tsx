import { render, screen } from "@testing-library/react";
import { TransferDestination } from "../TransferDestination";

describe("Component: TransferDestination", () => {
  it("should render custom header and footer correctly", () => {
    render(
      <TransferDestination
        header={<p>header content</p>}
        footer={<p>footer content</p>}
      />
    );
    expect(screen.getByText("header content")).toBeInTheDocument();
    expect(screen.getByText("footer content")).toBeInTheDocument();
  });

  it("should render correctly without any params", () => {
    render(<TransferDestination />);
    expect(screen.getByText(/select chain/i)).toBeInTheDocument();
  });
});
