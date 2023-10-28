import styled from "styled-components";
import { motion } from "framer-motion";
import { color, fontSize, spacement } from "@namada/utils";

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
  width: 480px;
  transition: background-color 0.3s linear;
  margin: 36px auto;
`;

export const UpperContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Subtitle = styled.p`
  color: ${color("utility2", "main")};
  font-size: ${fontSize("xl")};
  margin: ${spacement(1)} auto;
  max-width: 90%;
  text-align: center;
  font-weight: 500;
`;

export const LogoContainer = styled.div`
  max-width: 200px;
  margin: 0 auto;
`;

export const SubViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 440px;
  min-height: 400px;
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
  margin: 24px 0;
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
`;

export const HeaderContainer = styled.hgroup`
  color: ${color("utility2", "main")};
  margin-bottom: ${spacement(6)};
`;

export const WordSizeSelectorContainer = styled.div`
  margin-bottom: ${spacement(4)};
`;

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
  width: 100%;
  min-height: 170px;
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
  margin: 20px 0;
  display: flex;
  justify-content: center;
  width: 100%;
`;

export const InputContainer = styled.div`
  width: 100%;
  height: 92px;
  margin: 0 0 24px;
`;

export const RouteContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

export const SeedPhraseLengthContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: right;
  flex-direction: row;
  margin: 4px 0 12px;
`;

export const SeedPhraseLength = styled.div`
  padding: 0 8px;
`;
