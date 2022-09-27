import styled from "styled-components";

import { Input } from "@anoma/components";

export const AddAccountContainer = styled.div``;

export const AddAccountForm = styled.div``;

export const Bip44PathContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Bip44Input = styled(Input)``;

export const Bip44Path = styled.div`
  font-size: 11px;
`;

export const Bip44Error = styled.div`
  color: ${(props) => props.theme.colors.utility3.highAttention};
`;

export const FormStatus = styled.div``;

export const FormError = styled.div`
  color: ${(props) => props.theme.colors.utility3.highAttention};
`;
