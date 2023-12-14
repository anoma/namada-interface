import { Icon, IconName, IconSize } from "@namada/components";
import clsx from "clsx";
import { tv, type VariantProps } from "tailwind-variants";

const contentMasker = tv({
  slots: {
    base: "group w-full relative overflow-hidden border border-transparent rounded-md",
    blurred:
      "flex blur-sm transition-all duration-250 ease-out hover:blur-none p-2",
    icon: clsx(
      "flex h-[45%] justify-center left-1/2 max-w-20",
      "pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
      "transition-opacity duration-100 ease-out w-full group-hover:opacity-0",
      "[&_path]:stroke-yellow"
    ),
  },

  variants: {
    color: {
      primary: {
        base: "border-yellow",
      },
      secondary: {
        base: "border-cyan",
        icon: "[&_path]:stroke-cyan",
      },
      neutral: {
        base: "border-black",
        icon: "[&_path]:stroke-black",
      },
    },
  },
});

type ContentMaskerProps = {
  children: React.ReactNode;
} & VariantProps<typeof contentMasker>;

export const ContentMasker = (props: ContentMaskerProps): JSX.Element => {
  const { base, blurred, icon } = contentMasker({ color: props.color });
  return (
    <div className={base()}>
      <div className={blurred()}>{props.children}</div>
      <i className={icon()}>
        <Icon
          strokeColorOverride="currentColor"
          iconName={IconName.EyeHidden}
          iconSize={IconSize.Full}
        />
      </i>
    </div>
  );
};
