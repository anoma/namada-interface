import { Input } from "@namada/components";
import clsx from "clsx";

type IbcChannelsProps = {
  sourceChannel: string;
  destinationChannel?: string;
  onChangeSource: (sourceChannel: string) => void;
  onChangeDestination?: (destChannel: string) => void;
  isShielded: boolean;
};

export const IbcChannels = ({
  sourceChannel,
  destinationChannel,
  onChangeDestination,
  onChangeSource,
  isShielded,
}: IbcChannelsProps): JSX.Element => {
  return (
    <div className={clsx("relative bg-neutral-800 rounded-lg px-4 pt-6 pb-4")}>
      <fieldset className="flex flex-col gap-4">
        <Input
          placeholder="Source IBC Channel (ex: channel-4353)"
          label="Source IBC Channel"
          value={sourceChannel}
          onChange={(e) => onChangeSource(e.target.value)}
          required
        />
        {onChangeDestination && isShielded && (
          <Input
            placeholder="Destination IBC Channel (ex: channel-0)"
            label="Destination IBC channel"
            value={destinationChannel || ""}
            onChange={(e) => onChangeDestination(e.target.value)}
            required
          />
        )}
      </fieldset>
    </div>
  );
};
