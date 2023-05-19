import styled, { createGlobalStyle } from "styled-components";
import { motion } from "framer-motion";

export const GlobalStyles = createGlobalStyle`
  html, body {
    background-color: #000;
  }
`;

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  box-sizing: border-box;
  background-color: ${(props) => props.theme.colors.utility1.main80};
  border: 1px solid ${(props) => props.theme.colors.utility1.main80};
  border-radius: 8px;
  color: ${(props) => props.theme.colors.utility2.main80};
  padding: 0 36px;
  height: 100%;
  min-height: 400px;
  width: 480px;
  transition: background-color 0.3s linear;
  margin: 36px auto;
`;

export const MotionContainer = styled(motion.div)`
  height: 100%;
  box-sizing: border-box;
`;

export const TopSection = styled.section`
  display: flex;
  justify-content: start;
  align-items: center;
  width: 100%;
  margin: 32px 0;
`;

export const TopSectionHeaderContainer = styled.section`
  display: flex;
  justify-content: center;
  width: 100%;
  align-items: center;
`;

export const TopSectionButtonContainer = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  min-height: 50px;
`;

export const ContentContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

export const UpperContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  width: 100%;
`;

export const Header1 = styled.h1`
  margin: 8px 0;
  color: ${(props) => props.theme.colors.utility2.main};
`;

export const Header3 = styled.h3`
  margin: 8px 0;
  color: ${(props) => props.theme.colors.utility2.main};
`;

export const Header5 = styled.h5`
  margin: 8px 0;
  color: ${(props) => props.theme.colors.utility2.main};
`;

export const BodyText = styled.p`
  font-weight: 300;
  color: ${(props) => props.theme.colors.utility2.main80};
`;

export const ButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

export const SubViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 440px;
`;

export const InputContainer = styled.div`
  width: 100%;
  height: 92px;
  margin: 0 0 24px;
`;
