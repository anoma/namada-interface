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
  position?: "top" | "bottom";
};

export const DropdownMenu = ({
  id,
  align,
  position = "top",
  items,
}: DropdownMenuProps): JSX.Element => {
  const [isOpen, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = (): void => {
    setOpen(false);
  };

  const handleClick = (callback: DropdownClickFn) => (): void => {
    close();
    callback();
  };

  useEffect(() => {
    if (!overlayRef.current) return;

    overlayRef.current.addEventListener("click", close);
    return () => {
      if (!overlayRef.current) return;
      overlayRef.current.removeEventListener("click", close);
    };
  }, [isOpen]);

  return (
    <>
      <DropdownMenuContainer ref={containerRef}>
        <OpenDropdownIcon onClick={() => setOpen(true)}>
          <Icon
            iconName={IconName.ThreeDotsVertical}
            fillColorOverride="currentColor"
          />
        </OpenDropdownIcon>

        {isOpen && (
          <Dropdown align={align} position={position}>
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
