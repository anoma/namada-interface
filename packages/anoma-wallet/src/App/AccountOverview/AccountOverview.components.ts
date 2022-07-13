import styled from "styled-components/macro";

export const AccountOverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 100%;
  height: 100%;

  h1 {
    margin: 0;
  }

  h4 {
    margin: 12px 0;
  }

  h1,
  h4 {
    color: ${(props) => props.theme.colors.titleColor};
  }
`;

export const InputContainer = styled.div`
  width: 100%;
  justify-content: baseline;
  padding: 20px;

  input {
    width: 96%;
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

export const ButtonsWrapper = styled.div`
  display: flex;
  width: 70%;

  & > button {
    flex: 1;
    padding: 4px;
  }
`;

export const TotalContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const TotalHeading = styled.div`
  text-align: left;
`;

export const TotalAmount = styled.div`
  text-align: right;
  color: ${(props) => props.theme.colors.titleColor};
`;

export const HeadingContainer = styled.div`
  width: 100%;
`;
