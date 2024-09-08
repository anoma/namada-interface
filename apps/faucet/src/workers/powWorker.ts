import { PowChallenge, computePowSolution } from "utils";

// Worker script to handle computePowSolution
self.onmessage = (e: MessageEvent<PowChallenge>) => {
  const { challenge, difficulty } = e.data;
  const solution = computePowSolution(challenge, difficulty);
  self.postMessage(solution);
};
