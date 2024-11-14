import { Checkbox } from "@namada/components";
import {
  ApplicationFeatures,
  applicationFeaturesAtom,
} from "atoms/settings/atoms";
import { useAtom } from "jotai";

type FeaturesCheckboxProps = {
  label: string;
  id: string;
  featureId: keyof ApplicationFeatures;
};

export const FeaturesCheckbox = ({
  id,
  label,
  featureId,
}: FeaturesCheckboxProps): JSX.Element => {
  const [applicationFeatures, setApplicationFeatures] = useAtom(
    applicationFeaturesAtom
  );

  const onToggle = (): void => {
    const value = applicationFeatures[featureId];
    setApplicationFeatures({ ...applicationFeatures, [featureId]: !value });
  };

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        checked={applicationFeatures[featureId]}
        onChange={onToggle}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};
