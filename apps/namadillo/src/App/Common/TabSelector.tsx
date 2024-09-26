import clsx from "clsx";
import { twMerge } from "tailwind-merge";
type TabSelectorItem = {
  text: React.ReactNode;
  id: string;
  className?: string;
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
    <ul className="flex">
      {items.map((item) => (
        <li key={item.id} className="w-full">
          <button
            type="button"
            onClick={() => onChange(item)}
            className={twMerge(
              clsx(
                "w-full text-current rounded-sm bg-black opacity-50 py-1",
                "hover:opacity-80 transition-opacity duration-200",
                { "border border-current opacity-100": item.id === active },
                item.className
              )
            )}
          >
            {item.text}
          </button>
        </li>
      ))}
    </ul>
  );
};
