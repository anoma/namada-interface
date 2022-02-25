import styled from "styled-components/macro";

export const StyledDiv = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: nowrap;
  justify-content: space-between;
  border: 1px solid #2f2f2f;
  border-right: none;
`;

export const StyledButton = styled.button`
  cursor: pointer;
  height: 36px;
  padding: 0 16px;
  background: #444;
  color: #ddd;
  border: none;

  &:hover {
    background: #333;
  }
`;

export const StyledSpan = styled.span`
  cursor: pointer;
  display: block;
  width: 100%;
  height: 36px;
  line-height: 36px;
  padding: 0 16px;
  background: #181818;
  color: #ddd;
`;
