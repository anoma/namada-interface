import { color, spacement } from "@namada/utils";
import styled from "styled-components";
import { AnotherWays } from "./AnotherWays";

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

  article {
    width: 100%;
    overflow: hidden;
  }
`;

export const NonEligibleAnotherWays = styled(AnotherWays)`
  padding: ${spacement(9)} ${spacement(9)} ${spacement(10)};
`;
