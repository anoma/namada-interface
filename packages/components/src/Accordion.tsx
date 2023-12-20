import clsx from "clsx";
import { createElement, useState } from "react";
import { GoChevronDown } from "react-icons/go";
import { tv } from "tailwind-variants";

const accordion = tv({
  slots: {
    base: clsx(
      `flex flex-col items-center bg-transparent rounded-md text-base overflow-hidden`,
      `font-medium min-h-[2em] w-full border border-current [&_path]:stroke-current`
    ),
    header: clsx(
      `flex items-center justify-between py-[1em] px-6 w-full cursor-pointer`,
      `transition-all duration-200 ease-out-quart`
    ),
    indicator: clsx(
      `flex items-center justify-center rounded-full border border-current`,
      `h-9 w-9 transition-all duration-200 ease-out-quart`
    ),
    content: `px-6 py-[0.75em] w-full`,
  },

  variants: {
    color: {
      primary: {
        base: "text-yellow",
        header: "hover:bg-yellow hover:text-yellow-900",
      },
      secondary: {
        base: "text-cyan",
        header: "hover:bg-cyan hover:text-black",
      },
      neutral: {
        base: "text-black",
        header: "hover:bg-yellow hover:text-black",
      },
    },
    open: {
      true: {
        indicator: "rotate-180",
      },
    },
  },
});

export type AccordionProps = {
  htmlTag?: keyof React.ReactHTML;
  title?: string;
  headingLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  color: "primary" | "secondary" | "neutral";
  children: React.ReactNode;
};

export const Accordion = ({
  htmlTag = "article",
  title,
  headingLevel = "h3",
  color,
  children,
}: AccordionProps): JSX.Element => {
  const [open, setOpen] = useState(false);
  const { base, header, indicator, content } = accordion({ open, color });

  return createElement(
    htmlTag,
    { className: base() },
    <>
      <header className={header()} onClick={() => setOpen(!open)}>
        {createElement(headingLevel, {}, title)}
        <i className={indicator()}>
          <GoChevronDown />
        </i>
      </header>
      {open && <div className={content()}>{children}</div>}
    </>
  );
};
