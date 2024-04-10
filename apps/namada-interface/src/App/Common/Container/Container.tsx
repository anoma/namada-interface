import { Image } from "@namada/components";
import clsx from "clsx";

type ContainerProps = {
  header: JSX.Element;
  sidebar: JSX.Element;
  children: JSX.Element;
} & React.ComponentPropsWithoutRef<"div">;

export const Container = ({
  header,
  sidebar,
  children,
  ...props
}: ContainerProps): JSX.Element => {
  return (
    <div className="max-w-[1920px] px-6 mx-auto mb-6" {...props}>
      <header className="flex justify-between font-medium pt-4 pb-5 pl-6">
        <i
          className={clsx(
            "flex items-center gap-4 text-yellow text-lg not-italic uppercase"
          )}
        >
          <Image styleOverrides={{ width: "45px" }} imageName="LogoMinimal" />
          Dashboard
        </i>
        {header}
      </header>
      <div className="grid grid-cols-[1fr_4.5fr] gap-2.5 min-h-[calc(100svh-100px)]">
        <aside className="bg-black rounded-sm">{sidebar}</aside>
        <main>{children}</main>{" "}
      </div>
    </div>
  );
};
