import { borderRadius, color, spacement } from "@namada/utils";
import styled from "styled-components";

export const YouAreEligibleContainer = styled.div`
  display: flex;
  gap: ${spacement(8)};
  background-color: ${color("primary", "main")};
  border-radius: ${borderRadius("md")};
  width: 100%;
  padding: ${spacement(8)} ${spacement(4)};

  > div {
    align-items: center;
    width: 50%;
  }

  p {
    margin: 0;
  }
`;

export const YouAreEligibleMessage = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: ${spacement(1)};

  & > p {
    text-wrap: balance;
  }

  & > h1 {
    font-weight: 500;
  }
`;

export const WalletOrAddressContainer = styled.div`
  max-width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: ${spacement(4)};
  width: 100%;
`;

export const Panel = styled.div`
  display: flex;
  align-items: center;
  color: ${color("primary", "main")};
  background-color: black;
  border-radius: ${borderRadius("md")};
  color: ${color("primary", "main")};
  max-width: 100%;
  padding: ${spacement(5)} ${spacement(4)};
`;

export const IconContainer = styled.i`
  width: ${spacement(22)};
`;
