import { ButtonHTMLAttributes } from "react";

export const accountIconButtonClassname =
  "p-1 opacity-80 transition-opacity hover:opacity-100";

export const AccountIconButton = (
  props: ButtonHTMLAttributes<HTMLButtonElement>
): JSX.Element => {
  return <button className={accountIconButtonClassname} {...props} />;
};
