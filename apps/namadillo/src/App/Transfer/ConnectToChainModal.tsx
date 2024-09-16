import { SelectModal } from "App/Common/SelectModal";
import { Provider } from "types";

type ConnectToChainModalProps = {
  onClose: () => void;
  providers: Provider[];
  onConnect: (provider: Provider) => void;
};

export const ConnectToChainModal = ({
  onClose,
  onConnect,
  providers,
}: ConnectToChainModalProps): JSX.Element => {
  return (
    <SelectModal title="Source" onClose={onClose}>
      <ul>
        {providers.map((provider: Provider, index) => (
          <li key={index} className="px-5 text-sm">
            <button
              className="flex justify-between items-center w-full"
              onClick={() => onConnect(provider)}
            >
              <span className="flex gap-2 items-center text-white">
                <img
                  src={provider.iconUrl}
                  className="w-8 aspect-square rounded-sm"
                />
                {provider.name}
              </span>
              <span
                onClick={() => onConnect(provider)}
                className="text-xs text-neutral-400"
              >
                Connect
              </span>
            </button>
          </li>
        ))}
      </ul>
    </SelectModal>
  );
};
