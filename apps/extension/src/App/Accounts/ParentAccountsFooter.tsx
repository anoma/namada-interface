import { ActionButton } from "@namada/components";
import { GoArrowUpRight } from "react-icons/go";

export const ParentAccountsFooter = (): JSX.Element => {
  return (
    <div className="static bottom-5 w-full">
      <ActionButton
        href="https://namada.net/apps"
        target="_blank"
        referrerPolicy="no-referrer"
        className="font-8 relative w-full"
        outlineColor="yellow"
        textHoverColor="black"
        itemType="button"
      >
        <span>View Keychain compatible apps</span>
        <GoArrowUpRight className="absolute right-0 top-0 w-12 h-12 m-0" />
      </ActionButton>
    </div>
  );
};
