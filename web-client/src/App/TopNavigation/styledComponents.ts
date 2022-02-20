import styled from "styled-components";

export const TopNavigationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 32px;
`;

export const LeftSection = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  width: 50%;
  max-width: 280px;
`;

export const RightSection = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;
  width: 50%;
  max-width: 280px;
`;

export const HelpButton = styled.button`
  all: unset;
  cursor: pointer;
  display: flex;
  justify-content: end;
  align-items: center;
  margin: 0 32px 0 0;
`;

export const HelpTextContainer = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;
  margin: 0 16px;
  color: ${(props) => props.theme.colors.textPrimary};
`;

export const HelpIconContainer = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;
`;

export const ColorModeContainer = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;
`;
