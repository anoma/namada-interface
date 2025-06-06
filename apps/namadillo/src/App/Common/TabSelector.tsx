import clsx from "clsx";
import { twMerge } from "tailwind-merge";
type TabSelectorItem = {
  text: React.ReactNode;
  id: string;
  className?: string;
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
};

type TabSelectorProps = {
  items: TabSelectorItem[];
  active: string;
  onChange: (item: TabSelectorItem) => void;
};

export const TabSelector = ({
  items,
  active,
  onChange,
}: TabSelectorProps): JSX.Element => {
  return (
    <ul className="flex items-center">
      {items.map((item) => {
        return (
          <li key={item.id} className="w-full">
            <button
              type="button"
              onClick={() => onChange(item)}
              className={twMerge(
                clsx(
                  "w-full text-current rounded-sm bg-black/50 py-1",
                  "transition-colors duration-200",
                  { "border border-current opacity-100": item.id === active },
                  { "hover:bg-black/80": !item.buttonProps?.disabled },
                  { "!cursor-auto": item.buttonProps?.disabled },
                  item.className
                )
              )}
              {...(item.buttonProps || {})}
            >
              {item.text}
            </button>
          </li>
        );
      })}
    </ul>
  );
};
