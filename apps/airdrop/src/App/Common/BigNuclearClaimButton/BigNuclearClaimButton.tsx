import {
  InactiveButton,
  TextContainer,
  TextContainerLeft,
  TextContainerRight,
  ButtonText,
} from "./BigNuclearClaimButton.components";

type BigNuclearClaimButton = {
  valid: boolean;
  onClick: () => void;
};

export const BigNuclearClaimButton = ({
  valid,
  onClick,
}: BigNuclearClaimButton): JSX.Element => {
  if (valid) return <></>;

  return (
    !valid && (
      <InactiveButton onClick={onClick}>
        <TextContainer>
          <TextContainerLeft>
            <ButtonText>Complete Fields to Activate Claim</ButtonText>
          </TextContainerLeft>
          <TextContainerRight>
            <ButtonText>Complete Fields to Activate Claim</ButtonText>
          </TextContainerRight>
        </TextContainer>
      </InactiveButton>
    )
  );
};
