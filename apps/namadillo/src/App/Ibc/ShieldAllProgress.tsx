import { Stack } from "@namada/components";
import svgImg from "App/Assets/ShieldedParty.svg";
import { Timeline } from "App/Common/Timeline";
import ibcTransferBlack from "../Transfer/assets/ibc-transfer-black.png";
import { ShieldAllContainer } from "./ShieldAllContainer";

export const ShieldAllProgress = (): JSX.Element => {
  const currentStep = 2;
  return (
    <ShieldAllContainer>
      <div className="flex-1 text-black mt-4">
        <Timeline
          currentStepIndex={currentStep}
          steps={[
            { bullet: true, children: "Signature Required" },
            { bullet: true, children: "Generating ZK Proof" },
            {
              bullet: false,
              children: (
                <Stack gap={2}>
                  <img src={svgImg} alt="" />
                  IBC Transfer to Namada
                </Stack>
              ),
            },
          ]}
        />
      </div>
      <footer className="flex justify-center w-18 mx-auto">
        <img src={ibcTransferBlack} alt="" />
      </footer>
    </ShieldAllContainer>
  );
};
