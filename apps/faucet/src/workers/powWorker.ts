import { PowChallenge, computePowSolution } from "utils";

// Worker script to handle computePowSolution
self.onmessage = (e: MessageEvent<string>) => {
  const { challenge, difficulty } = JSON.parse(e.data) as PowChallenge;
  const solution = computePowSolution(challenge, difficulty);

  self.postMessage(JSON.stringify(solution));
};
