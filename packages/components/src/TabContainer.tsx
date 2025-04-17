import { ActionButton, ActionButtonProps } from "@namada/components";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { colors } from "./theme";

type TabContents = {
  title: React.ReactNode;
  children: React.ReactNode;
};

type TabContainerProps = {
  id: string;
  title: string;
  activeTabIndex: number;
  onChangeActiveTab: (index: number) => void;
  tabs: TabContents[];
  containerClassname?: string;
  tabGap?: string;
} & ActionButtonProps<"button">;

export const TabContainer = ({
  id,
  title,
  activeTabIndex,
  onChangeActiveTab,
  tabs,
  containerClassname,
  tabGap,
  ...buttonProps
}: TabContainerProps): JSX.Element => {
  return (
    <>
      <div
        role="tablist"
        aria-label={title}
        className={clsx("flex", tabGap && `gap-${tabGap}`)}
      >
        {tabs.map((tab: TabContents, index: number) => (
          <ActionButton
            key={index}
            id={`tab-${id}-${index}`}
            role="tab"
            aria-selected={activeTabIndex === index}
            aria-controls={`tabpanel-${id}-${index}`}
            tabIndex={activeTabIndex === index ? 0 : -1} // Only the active tab is focusable
            onClick={() => onChangeActiveTab(index)}
            size="md"
            style={
              {
                "--color":
                  activeTabIndex !== index ? colors.neutral[900] : colors.black,
                "--hover":
                  activeTabIndex !== index ? colors.neutral[900] : colors.black,
                "--text-color": colors.white,
                "--text-hover-color": colors.white,
              } as React.CSSProperties
            }
            {...buttonProps}
            className={twMerge(
              clsx("py-4 rounded-b-none"),
              buttonProps.className
            )}
          >
            <span className="inline-flex flex-col">
              {tab.title}
              {activeTabIndex === index && (
                <span className="w-full h-px bg-current" />
              )}
            </span>
          </ActionButton>
        ))}
      </div>

      {/* Tab Panel */}
      {tabs.map((tab: TabContents, index: number) => (
        <div
          key={index}
          className={containerClassname}
          id={`tabpanel-${id}-${index}`}
          role="tabpanel"
          aria-labelledby={`tab-${id}-${index}`}
          hidden={activeTabIndex !== index}
        >
          {tab.children}
        </div>
      ))}
    </>
  );
};
