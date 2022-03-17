import styled from "styled-components/macro";

export const WordChipContainer = styled.span`
  padding: 0.625rem 0.7rem;
  border: 1px solid ${(props) => props.theme.colors.wordchip};
  border-radius: 0.5rem;
  display: flex;
  margin-top: 1.25em;
`;

export const NumberContainer = styled.span`
  margin-right: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${(props) => props.theme.colors.wordchip};
`;

export const TextContainer = styled.span`
  margin-right: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${(props) => props.theme.colors.wordchipText};
  width: 100%;
`;
