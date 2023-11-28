import styled from "styled-components";
export const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 20px;
  width: 100%;
  margin-top: 32px;
`;
export const CardContainer = styled.a`
  display: flex;
  flex-direction: column;
  min-height: 140px;
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

export const CallToActionContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const LeftBorder = styled.div`
  height: 90%;
  position: absolute;
  left: 0;
  top: 5%;
  width: 1px;
  background: ${(props) => props.theme.colors.utility3.black};
`;

export const RightBorder = styled.div`
  height: 90%;
  position: absolute;
  right: 0;
  top: 5%;
  width: 1px;
  background: ${(props) => props.theme.colors.utility3.black};
`;

export const TopBorder = styled.div`
  width: 90%;
  position: absolute;
  top: 0;
  height: 1px;
  background: ${(props) => props.theme.colors.utility3.black};
`;

export const BottomBorder = styled.div`
  width: 90%;
  position: absolute;
  bottom: 0;
  height: 1px;
  background: ${(props) => props.theme.colors.utility3.black};
`;
export const InclineArrowIcon = styled.img`
  transition: transform 0.3s ease-in-out;
`;
