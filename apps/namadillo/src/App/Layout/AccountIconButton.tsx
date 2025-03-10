import { ButtonHTMLAttributes } from "react";

export const AccountIconButton = (
  props: ButtonHTMLAttributes<HTMLButtonElement>
): JSX.Element => {
  return (
    <button
      className="p-1 opacity-80 transition-opacity hover:opacity-100"
      {...props}
    />
  );
};
