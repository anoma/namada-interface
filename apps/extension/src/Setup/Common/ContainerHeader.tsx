import { Heading, ProgressIndicator } from "@namada/components";
import clsx from "clsx";
import { GoArrowLeft } from "react-icons/go";
import { useNavigate } from "react-router-dom";

type ContainerHeaderProps = {
  totalSteps: number;
  currentStep: number;
  pageTitle?: string;
};

export const ContainerHeader = ({
  pageTitle,
  totalSteps,
  currentStep,
}: ContainerHeaderProps): JSX.Element => {
  const navigate = useNavigate();
  return (
    <>
      <div className="relative flex items-center min-h-[22px]">
        {/* Don't show return button in the last step */}
        {currentStep < totalSteps && (
          <span
            className={clsx(
              "flex absolute items-center text-white cursor-pointer",
              "top-0 left-0 text-[22px] transition-colors hover:text-yellow active:top-px"
            )}
            onClick={() => navigate(-1)}
          >
            <GoArrowLeft />
          </span>
        )}
        <ProgressIndicator
          keyName="setup"
          totalSteps={totalSteps}
          currentStep={currentStep}
        />
      </div>
      {pageTitle && (
        <hgroup className="mt-3 mb-4">
          <Heading
            level="h2"
            className="max-w-[70%] text-xl text-white mx-auto text-center leading-[1.25]"
          >
            {pageTitle}
          </Heading>
        </hgroup>
      )}
    </>
  );
};
