import clsx from "clsx";
import { tv } from "tailwind-variants";

const container = tv({
  slots: {
    base: "flex items-center bg-black justify-center py-7 min-h-[100svh]",
    wrapper: clsx(
      "bg-neutral-800 rounded-md relative flex basis-[min-content] flex-col grow-0 max-w-full",
      "overflow-hidden transition-all duration-100 ease-out min-w-[540px]"
    ),
    header: "border-b-2 border-black relative py-5 relative",
    body: "pt-6 px-7 pb-8 flex-1 animate-fade-in sm:px-8 sm:py-8",
  },
  variants: {
    size: {
      popup: {
        base: "items-stretch py-0 w-full",
        wrapper: "rounded-none min-h-[320px] min-w-full",
      },
      base: {},
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
