import { fireEvent, render, screen } from "@testing-library/react";
import { IbcChannels } from "App/Transfer/IbcChannels";

describe("Component: IbcChannels", () => {
  const mockOnChangeSource = jest.fn();
  const mockOnChangeDestination = jest.fn();

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should render source channel input correctly", () => {
    render(
      <IbcChannels
        sourceChannel="channel-1"
        onChangeSource={mockOnChangeSource}
        isShielded={false}
      />
    );

    const sourceInput = screen.getByLabelText(/Source IBC Channel/i);
    expect(sourceInput).toBeInTheDocument();
    expect(sourceInput).toHaveValue("channel-1");

    fireEvent.change(sourceInput, { target: { value: "channel-2" } });
    expect(mockOnChangeSource).toHaveBeenCalledWith("channel-2");
  });

  it("should not render destination channel input when isShielded is false", () => {
    render(
      <IbcChannels
        sourceChannel="channel-1"
        onChangeSource={mockOnChangeSource}
        isShielded={false}
      />
    );
    const destinationInput = screen.queryByLabelText(
      /Destination IBC Channel/i
    );
    expect(destinationInput).not.toBeInTheDocument();
  });

  it("should render destination channel input when isShielded is true", () => {
    render(
      <IbcChannels
        sourceChannel="channel-1"
        destinationChannel="channel-0"
        onChangeSource={mockOnChangeSource}
        onChangeDestination={mockOnChangeDestination}
        isShielded={true}
      />
    );

    const destinationInput = screen.getByLabelText("Destination IBC channel");
    expect(destinationInput).toHaveValue("channel-0");
    fireEvent.change(destinationInput, { target: { value: "channel-3" } });
    expect(mockOnChangeDestination).toHaveBeenCalledWith("channel-3");
  });
});
