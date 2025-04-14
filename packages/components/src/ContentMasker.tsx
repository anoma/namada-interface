import clsx from "clsx";
import { GoEyeClosed } from "react-icons/go";
import { tv, type VariantProps } from "tailwind-variants";

const contentMasker = tv({
  slots: {
    base: "group w-full relative border border-transparent rounded-md",
    blurred:
      "flex blur-sm transition-all duration-500 ease-out hover:blur-none",
    icon: clsx(
      "h-10 flex aspect-square w-full justify-center left-1/2 max-w-[100px] w-full text-yellow",
      "pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
      "transition-opacity duration-100 ease-out",
      "[&_svg]:!w-full [&_svg]:!h-full group-hover:opacity-0"
    ),
  },

  variants: {
    color: {
      primary: {
        base: "border-yellow",
      },
      secondary: {
        base: "border-cyan",
      },
      neutral: {
        base: "border-black",
      },
    },
  },
});

type ContentMaskerProps = {
  children: React.ReactNode;
  hideIcon?: boolean;
} & VariantProps<typeof contentMasker>;

export const ContentMasker = (props: ContentMaskerProps): JSX.Element => {
  const { base, blurred, icon } = contentMasker({ color: props.color });
  return (
    <div className={base()}>
      <div className={blurred()}>{props.children}</div>
      {!props.hideIcon && (
        <i className={icon()}>
          <GoEyeClosed />
        </i>
      )}
    </div>
  );
};
