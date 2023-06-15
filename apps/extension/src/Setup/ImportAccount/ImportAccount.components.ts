import styled from "styled-components";

export const ImportAccountViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
`;

export const ImportAccountViewUpperPartContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Header1 = styled.h1`
  margin: 8px 0;
  color: ${(props) => props.theme.colors.utility2.main};
`;

export const BodyText = styled.p`
  text-align: center;
  font-weight: 300;
  color: ${(props) => props.theme.colors.utility2.main80};
`;
