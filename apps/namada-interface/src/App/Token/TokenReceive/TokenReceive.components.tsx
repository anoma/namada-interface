import styled from "styled-components";

export const Address = styled.pre`
  color: ${(props) => props.theme.colors.utility2.main80};
  background-color: ${(props) => props.theme.colors.utility2.main60};
  font-size: 12px;
  margin: 0 0 20px 0;
  padding: 4px 8px;
  border-radius: 4px;
  scrollbar-width: 0;
  white-space: pre-wrap;
  word-wrap: break-word;

  ::-webkit-scrollbar {
    display: none;
  }
`;

export const TokenReceiveContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  width: 100%;
  height: 100%;
`;

export const TokenReceiveContent = styled.div`
  width: 100%;
  padding: 0 40px;
  margin: 20px 0;
  height: 400px;
  box-sizing: border-box;

  // TODO unify pre as a component if it is being used
  // but do we really need pre in these?
  pre {
    background-color: ${(props) => props.theme.colors.utility1.main70};
    color: ${(props) => props.theme.colors.utility2.main80};
  }
`;

export const CanvasContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 20px 0 40px;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 0 40px;
  margin: 20px 0;
  box-sizing: border-box;
`;
