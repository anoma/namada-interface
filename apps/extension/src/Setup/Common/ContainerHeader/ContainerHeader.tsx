import {
  Icon,
  IconName,
  Image,
  ImageName,
  ProgressIndicator,
} from "@namada/components";
import { LogoContainer, ReturnIcon } from "./ContainerHeader.components";
import { useNavigate } from "react-router-dom";

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
          <Image imageName={ImageName.Logo} />
        </LogoContainer>
      )}
      {totalSteps > 0 && (
        <>
          {/* Don't show return button in the last step */}
          {currentStep < totalSteps && (
            <ReturnIcon onClick={() => navigate(-1)}>
              <Icon
                strokeColorOverride="currentColor"
                fillColorOverride="currentColor"
                iconName={IconName.ArrowLeft}
              />
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
