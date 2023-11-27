import { color, spacement } from "@namada/utils";
import styled from "styled-components";

export const NonEligiblePanel = styled.div`
  color: ${color("primary", "main")};
  display: flex;
  align-items: center;
  gap: ${spacement(10)};
  justify-content: center;
  margin: ${spacement(16)} 0 ${spacement(16)};

  h1 {
    text-align: left;
    margin: 0;
  }

  p {
    font-size: 18px;
    margin: 0;
  }

  hr {
    border-color: ${color("primary", "main")};
    margin: ${spacement(5)} 0;
  }
`;
