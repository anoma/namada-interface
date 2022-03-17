import styled from "styled-components/macro";

const Button = styled.button`
  padding: 0.75em 1.25em;
  margin: 0.75em 1.25em;
  font-size: 1em;
  border-style: solid;
  text-align: center;
  font-weight: 500;
  cursor: pointer;
`;

const RoundButton = styled(Button)`
  border-radius: 200px;
  border-width: 1px 1px 4px 1px;
`;

export const OutlinedButton = styled(RoundButton)`
  border-color: ${(props) => props.theme.colors.buttonBorder1};
  background-color: ${(props) => props.theme.colors.buttonBackground1};
  color: ${(props) => props.theme.colors.buttonText1};
  &:hover {
    border-color: ${(props) => props.theme.colors.buttonHover1};
  }
  &:disabled {
    opacity: 30%;
  }
`;

export const ContainedButton = styled(RoundButton)`
  border-color: ${(props) => props.theme.colors.buttonBorder2};
  background-color: ${(props) => props.theme.colors.buttonBackground2};
  color: ${(props) => props.theme.colors.buttonText2};
  &:hover {
    border-color: ${(props) => props.theme.colors.buttonHover2};
  }
  &:disabled {
    opacity: 30%;
  }
`;

export const ContainedAltButton = styled(RoundButton)`
  border-color: ${(props) => props.theme.colors.buttonBorder3};
  background-color: ${(props) => props.theme.colors.buttonBackground3};
  color: ${(props) => props.theme.colors.buttonText3};
  &:hover {
    border-color: ${(props) => props.theme.colors.buttonHover3};
  }
  &:disabled {
    opacity: 30%;
  }
`;

export const SmallButton = styled(Button)`
  border-width: 1px;
  border-radius: 4px;
  background-color: transparent;
  border-color: ${(props) => props.theme.colors.buttonTextSmall};
  color: ${(props) => props.theme.colors.buttonTextSmall};
  &:active {
    background-color: ${(props) => props.theme.colors.buttonTextSmall};
    color: white;
  }
`;
