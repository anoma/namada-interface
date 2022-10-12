import styled from "styled-components";

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: 50px;
  margin: 0 12px;
  height: 36px;
`;

export const LockExtensionButton = styled.a`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  color: ${(props) => props.theme.colors.utility1.main20};

  & > div > svg > path {
    stroke: ${(props) => props.theme.colors.utility1.main20};
    fill: ${(props) => props.theme.colors.utility1.main20};
  }
`;
