import { ActionButton } from "@namada/components";

type ConnectProviderButtonProps = {
  onClick?: () => void;
};

export const ConnectProviderButton = ({
  onClick,
}: ConnectProviderButtonProps): JSX.Element => {
  return (
    <ActionButton
      type="button"
      className="inline-flex absolute top-0 right-0 w-auto text-xs px-2 py-px"
      onClick={onClick}
      size="xs"
      backgroundColor="white"
    >
      Connect Wallet
    </ActionButton>
  );
};
