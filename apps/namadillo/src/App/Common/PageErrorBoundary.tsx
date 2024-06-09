import { Component, ReactNode } from "react";
import { MdOutlineFace5 } from "react-icons/md";

type PageErrorProps = {
  children: React.ReactNode;
};

type PageErrorState = {
  displayError?: boolean;
  errorTitle?: string;
  errorDescription?: string;
};

export class PageErrorBoundary extends Component<
  PageErrorProps,
  PageErrorState
> {
  state: PageErrorState = { displayError: false };

  componentDidCatch(error: Error): void {
    this.setState({
      displayError: true,
      errorDescription: error.message,
      errorTitle: error.name,
    });
  }

  render(): ReactNode {
    const { displayError } = this.state;

    if (!displayError) return this.props.children;

    return (
      <div className="flex items-center justify-center flex-1 w-full h-full relative">
        <div className="flex flex-col gap-2 items-center text-error">
          <MdOutlineFace5 />
          <strong>{this.state.errorTitle || "An error occurred"}</strong>
          <p>
            {this.state.errorDescription ||
              "An unknown error occurred while loading the page"}
          </p>
        </div>
      </div>
    );
  }
}
