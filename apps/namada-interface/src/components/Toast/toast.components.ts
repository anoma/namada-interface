import styled from "styled-components/macro";
import { motion } from "framer-motion";

export const Wrapper = styled(motion.div)<{ index: number }>`
  display: flex;
  justify-content: space-between;
  position: fixed;
  transition: top 0.5s;
  top: ${(props) => 100 + props.index * 70}px;
  right: 15px;
  width: 360px;
  z-index: 10;
  border-radius: 4px;
  border-color: ${(props) => props.theme.colors.primary.main60};
  color: ${(props) => props.theme.colors.utility3.black};
  outline: 1px solid ${(props) => props.theme.colors.utility3.black};

  &.info {
    background-color: ${(props) => props.theme.colors.utility3.white};
  }

  &.success {
    background-color: ${(props) => props.theme.colors.utility3.success};
  }

  &.error {
    background-color: ${(props) => props.theme.colors.utility3.highAttention};
  }

  &.warning {
    background-color: ${(props) => props.theme.colors.utility3.lowAttention};
  }
`;

export const Container = styled.div``;

export const Content = styled.div`
  padding: 12px;
  width: 270px;
`;

export const Title = styled.div`
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Message = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CloseToastButton = styled.div`
  cursor: pointer;
  display: flex;
  padding: 0 12px;
`;
