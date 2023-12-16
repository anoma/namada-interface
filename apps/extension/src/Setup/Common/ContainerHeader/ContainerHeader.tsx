import { Icon, Image, ProgressIndicator } from "@namada/components";
import { useNavigate } from "react-router-dom";
import { LogoContainer, ReturnIcon } from "./ContainerHeader.components";

type ContainerHeaderProps = {
  totalSteps: number;
  currentStep: number;
};

export const ContainerHeader = ({
  totalSteps,
  currentStep,
}: ContainerHeaderProps): JSX.Element => {
  const navigate = useNavigate();
  return (
    <>
      {totalSteps === 0 && (
        <LogoContainer>
          <Image imageName="Logo" />
        </LogoContainer>
      )}
      {totalSteps > 0 && (
        <>
          {/* Don't show return button in the last step */}
          {currentStep < totalSteps && (
            <ReturnIcon onClick={() => navigate(-1)}>
              <Icon fill name="ArrowLeft" />
            </ReturnIcon>
          )}
          <ProgressIndicator
            keyName="setup"
            totalSteps={totalSteps}
            currentStep={currentStep}
          />
        </>
      )}
    </>
  );
};
