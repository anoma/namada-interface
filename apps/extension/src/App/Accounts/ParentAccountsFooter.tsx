import { ActionButton } from "@namada/components";
import { GoArrowUpRight } from "react-icons/go";

export const ParentAccountsFooter = (): JSX.Element => {
  return (
    <div>
      <ActionButton
        href="https://namada.net/apps"
        target="_blank"
        rel="noreferrer"
        outlineColor="yellow"
        textHoverColor="black"
        itemType="button"
        icon={<GoArrowUpRight className="w-6 h-6" />}
        iconPosition="right"
      >
        View Keychain compatible apps
      </ActionButton>
    </div>
  );
};
