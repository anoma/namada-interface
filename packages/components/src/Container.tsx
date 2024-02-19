import clsx from "clsx";
import { tv } from "tailwind-variants";

const container = tv({
  slots: {
    base: "flex items-center bg-black justify-center py-7 min-h-[100svh]",
    wrapper: clsx(
      "bg-neutral-800 rounded-lg relative flex flex-col grow-0 max-w-full",
      "px-10 overflow-hidden transition-all duration-100 ease-out"
    ),
    header: "relative pt-5 relative",
    body: "flex-1 animate-fade-in",
  },
  variants: {
    size: {
      popup: {
        base: "items-stretch py-0 w-full",
        wrapper: "rounded-none min-h-[320px] min-w-full basis-[min-content] ",
      },
      base: {
        wrapper: "w-[540px] min-h-[600px]",
      },
    },
  },
});

export type ContainerProps = {
  children: React.ReactNode;
  size?: "popup" | "base";
  className?: string;
  header?: React.ReactNode;
};

export const Container = (props: ContainerProps): JSX.Element => {
  const { header, base, wrapper, body } = container({
    size: props.size || "base",
  });

  return (
    <div className={base()}>
      <section className={wrapper({ class: props.className })}>
        {props.header && <header className={header()}>{props.header}</header>}
        <div className={body()}>{props.children}</div>
      </section>
    </div>
  );
};
