import styled from "styled-components";
export const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 14px;
  width: 100%;
  margin-top: 32px;
`;
export const CardContainer = styled.a`
  display: flex;
  flex-direction: column;
  min-height: 128px;
  position: relative;
  padding: 16px;
  border-radius: 12px;
  justify-content: space-between;
  text-decoration: none;
  &:hover {
    background: ${(props) => props.theme.colors.utility3.black};
    cursor: pointer;
    transition: all 0.3s linear;
  }
`;
export const CardDescription = styled.p`
  color: ${(props) => props.theme.colors.utility1.main};
  font-size: ${(props) => props.theme.fontSize.base};
  font-weight: 500;
  margin: 0;
  padding: 0;
  ${CardContainer}:hover & {
    color: ${(props) => props.theme.colors.primary.main};
    transition: all 0.3s linear;
  }
  @media screen and (max-width: 860px) {
    font-size: ${(props) => props.theme.fontSize.sm};
  }
`
export const CardHeading = styled(CardDescription)`
  font-size: ${(props) => props.theme.fontSize['2xl']};
  @media screen and (max-width: 860px) {
    font-size: ${(props) => props.theme.fontSize.xl};
  }
`

export const CallToActionContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const LeftBorder = styled.div`
  height: 90%;
  position: absolute;
  left: 1px;
  top: 5%;
  width: 1px;
  background: ${(props) => props.theme.colors.utility3.black};
`;

export const RightBorder = styled.div`
  height: 90%;
  position: absolute;
  right: 1px;
  top: 5%;
  width: 1px;
  background: ${(props) => props.theme.colors.utility3.black};
`;

export const TopBorder = styled.div`
  width: 90%;
  position: absolute;
  top: 1px;
  height: 1px;
  background: ${(props) => props.theme.colors.utility3.black};
  align-self: center;
`;

export const BottomBorder = styled.div`
  width: 90%;
  position: absolute;
  bottom: 1px;
  height: 1px;
  background: ${(props) => props.theme.colors.utility3.black};
  align-self: center;
`;
export const InclineArrowIcon = styled.img`
  transition: transform 0.3s ease-in-out;
`;
