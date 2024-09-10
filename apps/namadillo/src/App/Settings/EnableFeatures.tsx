import { Stack } from "@namada/components";
import { FeaturesCheckbox } from "./FeaturesCheckbox";

export const EnableFeatures = (): JSX.Element => {
  return (
    <Stack gap={2}>
      <h3 className="mb-4 text-sm">Click to enable next phases features</h3>
      <Stack as="ul" gap={3}>
        <li>
          <FeaturesCheckbox
            id="advanced-claim-rewards"
            label="Claim Rewards"
            featureId="claimRewardsEnabled"
          />
        </li>
        <li>
          <FeaturesCheckbox
            id="advanced-masp"
            label="MASP"
            featureId="maspEnabled"
          />
        </li>
        <li>
          <FeaturesCheckbox
            id="advanced-ibc-transfers"
            label="IBC Transfers"
            featureId="ibcTransfersEnabled"
          />
        </li>
        <li>
          <FeaturesCheckbox
            id="advanced-ibc-shielding"
            label="IBC Shielding"
            featureId="ibcShieldingEnabled"
          />
        </li>
        <li>
          <FeaturesCheckbox
            id="advanced-shielded-rewards"
            label="Shielding Rewards"
            featureId="shieldingRewardsEnabled"
          />
        </li>
        <li>
          <FeaturesCheckbox
            id="advanced-nam-transfers"
            label="NAM Transfers"
            featureId="namTransfersEnabled"
          />
        </li>
      </Stack>
    </Stack>
  );
};
