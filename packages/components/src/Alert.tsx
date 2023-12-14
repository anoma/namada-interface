import { tv, type VariantProps } from "tailwind-variants";

const alert = tv({
  slots: {
    base: "border border-current rounded-md text-base font-normal px-6 py-5",
    title: "font-bold block uppercase text-sm mb-2",
  },
  variants: {
    type: {
      success: "",
      error: { base: "text-red-500" },
      warning: { base: "bg-yellow-900 text-yellow" },
      info: {
        base: "bg-neutral-900 text-white border-0",
        title: "text-yellow",
      },
    },
  },
});

type AlertBaseProps = VariantProps<typeof alert>;
type AlertProps = { title: string; children: React.ReactNode } & AlertBaseProps;

export const Alert = ({
  title,
  children,
  ...props
}: AlertProps): JSX.Element => {
  const alertClass = alert(props);
  return (
    <div className={alertClass.base()} role="dialog" aria-labelledby={title}>
      {title && <strong className={alertClass.title()}>{title}</strong>}
      <div>{children}</div>
    </div>
  );
};
