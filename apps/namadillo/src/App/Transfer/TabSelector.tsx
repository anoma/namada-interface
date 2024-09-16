import clsx from "clsx";
type TabSelectorItem = {
  text: React.ReactNode;
  id: string;
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
              className={clsx(
                "border border-current text-current rounded-sm bg-black",
                { "border border-current": item.id === active }
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
