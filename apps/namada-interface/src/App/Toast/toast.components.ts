import styled from "styled-components";
import { motion } from "framer-motion";

export const Wrapper = styled(motion.div)<{ index: number }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  transition: top 0.5s;
  top: ${(props) => 100 + props.index * 70}px;
  right: 15px;
  width: 360px;
  z-index: 99999;
  border-radius: 4px;
  border-color: ${(props) => props.theme.colors.primary.main60};
  color: ${(props) => props.theme.colors.utility3.black};
  outline: 1px solid ${(props) => props.theme.colors.utility3.black};

  &.info,
  &.pending-info {
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

  &.pending-info {
    &::before {
      content: "";
      margin: 5px 5px 5px 15px;
      min-width: 24px;
      width: 24px;
      height: 24px;
      border: 2px solid transparent;
      border-top-color: ${(props) => props.theme.colors.secondary.main};
      border-radius: 50%;
      animation: button-loading-spinner 1s ease infinite;
      @keyframes button-loading-spinner {
        from {
          transform: rotate(0turn);
        }
        to {
          transform: rotate(1turn);
        }
      }
    }
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
