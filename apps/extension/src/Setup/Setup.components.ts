import styled from "styled-components";
import { motion } from "framer-motion";
import { color, fontSize, spacement } from "@namada/utils";

export const Subtitle = styled.p`
  color: ${color("utility2", "main")};
  font-size: ${fontSize("xl")};
  margin: ${spacement(1)} auto;
  max-width: 90%;
  text-align: center;
  font-weight: 500;
`;

export const MotionContainer = styled(motion.div)`
  height: 100%;
  box-sizing: border-box;
`;

export const HeaderContainer = styled.hgroup`
  color: ${color("utility2", "main")};
  margin-bottom: ${spacement(7)};
`;

export const BodyText = styled.p``;

export const Form = styled.form``;
