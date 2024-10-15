import { ActionButton, ActionButtonProps } from "@namada/components";
import clsx from "clsx";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

type TabContents = {
  title: React.ReactNode;
  children: React.ReactNode;
};

type TabContainerProps = {
  id: string;
  title: string;
  tabs: TabContents[];
} & ActionButtonProps<"button">;

export const TabContainer = ({
  id,
  title,
  tabs,
  ...buttonProps
}: TabContainerProps): JSX.Element => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  return (
    <div>
      <div role="tablist" aria-label={title} className="flex">
        {tabs.map((tab: TabContents, index: number) => (
          <ActionButton
            key={index}
            id={`tab-${id}-${index}`}
            role="tab"
            aria-selected={activeTabIndex === index}
            aria-controls={`tabpanel-${id}-${index}`}
            tabIndex={activeTabIndex === index ? 0 : -1} // Only the active tab is focusable
            onClick={() => setActiveTabIndex(index)}
            size="md"
            backgroundColor="rblack"
            textHoverColor="white"
            {...buttonProps}
            className={twMerge(
              clsx("text-white py-4", {
                "opacity-50": activeTabIndex !== index,
              }),
              buttonProps.className
            )}
          >
            {tab.title}
          </ActionButton>
        ))}
      </div>

      {/* Tab Panel */}
      {tabs.map((tab: TabContents, index: number) => (
        <div
          key={index}
          id={`tabpanel-${id}-${index}`}
          role="tabpanel"
          aria-labelledby={`tab-${id}-${index}`}
          hidden={activeTabIndex !== index}
        >
          {tab.children}
        </div>
      ))}
    </div>
  );
};
