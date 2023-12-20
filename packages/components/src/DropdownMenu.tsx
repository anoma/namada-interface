import { Icon } from "@namada/components";
import clsx from "clsx";
import { useState } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const dropdownMenu = tv({
  slots: {
    base: "relative w-2",
    icon: "flex w-full items-center cursor-pointer [&_circle]:fill-current",
    list: clsx(
      "bg-neutral-800 rounded-md border border-neutral-700 pb-7 overflow-hidden",
      "absolute -right-2 w-58 z-20"
    ),
    item: clsx(
      "border-b border-yellow-700 text-neutral-300 cursor-pointer font-medium",
      "text-base py-2.5 px-6 select-none"
    ),
    overlay: clsx(
      "fixed left-0 top-0 bg-black/10 w-full h-full z-10 cursor-pointer"
    ),
  },
  variants: {
    disabled: {
      true: {
        item: `text-neutral-500 cursor-default hover:bg-transparent`,
      },
      false: {
        item: `transition-all duration-150 ease-out hover:bg-yellow hover:text-black`,
      },
    },
    position: {
      top: {
        list: "-top-2",
      },
      bottom: {
        list: "-bottom-2",
      },
    },
    align: {
      left: {
        item: "text-left",
      },
      right: {
        item: "text-right",
      },
      center: {
        item: "text-center",
      },
    },
  },
  defaultVariants: {
    align: "right",
    position: "top",
  },
});

type DropdownClickFn = () => void;
type DropdownMenuItem = {
  label: string;
  onClick?: DropdownClickFn;
};

type DropdownMenuProps = {
  id: string;
  items: DropdownMenuItem[];
  align: "left" | "center" | "right";
  position?: "top" | "bottom";
} & VariantProps<typeof dropdownMenu>;

export const DropdownMenu = (props: DropdownMenuProps): JSX.Element => {
  const [isOpen, setOpen] = useState(false);

  const handleClick = (callback: DropdownClickFn) => (): void => {
    setOpen(false);
    callback();
  };

  const {
    base,
    icon,
    list,
    item: itemClassList,
    overlay,
  } = dropdownMenu({
    align: props.align,
    position: props.position,
  });

  return (
    <>
      <div className={base()}>
        <span className={icon()} onClick={() => setOpen(true)}>
          <Icon name="ThreeDotsVertical" fill={true} />
        </span>
        {isOpen && (
          <ul className={list()}>
            {props.items.map((item, index) => (
              <li
                key={`dropdown-item-${props.id}-${index}`}
                className={itemClassList({ disabled: !item.onClick })}
                onClick={item.onClick && handleClick(item.onClick)}
              >
                {item.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {isOpen && <div className={overlay()} onClick={() => setOpen(false)} />}
    </>
  );
};
