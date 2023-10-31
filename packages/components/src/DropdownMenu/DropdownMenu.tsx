import { Icon, IconName } from "@namada/components";
import {
  Dropdown,
  DropdownItem,
  DropdownMenuContainer,
  DropdownOverlay,
  OpenDropdownIcon,
} from "./DropdownMenu.components";
import { useEffect, useRef, useState } from "react";

type DropdownClickFn = () => void;

type DropdownMenuItem = {
  label: string;
  onClick?: DropdownClickFn;
};

type DropdownMenuProps = {
  id: string;
  items: DropdownMenuItem[];
  align: "left" | "center" | "right";
};

export const DropdownMenu = ({
  id,
  align,
  items,
}: DropdownMenuProps): JSX.Element => {
  const [isOpen, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current) return;

    const close = (): void => {
      if (isOpen) {
        setOpen(false);
      }
    };

    overlayRef.current.addEventListener("click", close);
    return () => {
      if (!overlayRef.current) return;
      overlayRef.current.removeEventListener("click", close);
    };
  }, [isOpen]);

  const handleClick = (callback: DropdownClickFn) => (): void => {
    setOpen(false);
    callback();
  };

  return (
    <>
      <DropdownMenuContainer>
        <OpenDropdownIcon onClick={() => setOpen(true)}>
          <Icon
            iconName={IconName.ThreeDotsVertical}
            fillColorOverride="currentColor"
          />
        </OpenDropdownIcon>
        {isOpen && (
          <Dropdown align={align}>
            {items.map((item, index) => (
              <DropdownItem
                key={`dropdown-item-${id}-${index}`}
                onClick={item.onClick && handleClick(item.onClick)}
                disabled={!item.onClick}
              >
                {item.label}
              </DropdownItem>
            ))}
          </Dropdown>
        )}
      </DropdownMenuContainer>
      {isOpen && <DropdownOverlay ref={overlayRef} />}
    </>
  );
};
