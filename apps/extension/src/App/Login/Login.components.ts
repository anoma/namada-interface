import styled from "styled-components";

export const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const LoginError = styled.div`
  color: ${(props) => props.theme.colors.utility3.highAttention};
`;
