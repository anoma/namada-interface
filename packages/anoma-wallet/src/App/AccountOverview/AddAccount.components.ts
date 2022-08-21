import styled from "styled-components/macro";

export const AddAccountContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0;
  color: ${(props) => props.theme.colors.utility2.main};
`;

export const AddAccountContent = styled.div`
  width: 100%;
  min-height: 500px;
  padding: 0 40px;
  box-sizing: border-box;
`;

export const ButtonsContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0 40px;
  margin: 0 0 20px 0;

  & > a {
    position: absolute;
    left: 10%;
  }
`;
