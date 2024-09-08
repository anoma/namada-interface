import styled from "styled-components";

export const Banner = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.colors.utility3.highAttention};
  color: ${(props) => props.theme.colors.primary.main20};
  font-size: 13px;
  font-weight: bold;
`;

export const BannerContents = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  max-width: 762px;
  padding: 8px 0;
  margin: 0 20px;
`;
