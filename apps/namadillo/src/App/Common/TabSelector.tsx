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
    <nav>
      <ul className="flex">
        {items.map((item) => (
          <li key={item.id} className="w-full">
            <button
              onClick={() => onChange(item)}
              className={twMerge(
                clsx(
                  "border border-current text-current rounded-sm bg-black opacity-70",
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
    </nav>
  );
};
