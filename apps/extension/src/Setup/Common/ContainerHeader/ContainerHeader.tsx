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
          <ReturnIcon onClick={() => navigate(-1)}>
            <Icon iconName={IconName.ChevronLeft} />
          </ReturnIcon>
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
