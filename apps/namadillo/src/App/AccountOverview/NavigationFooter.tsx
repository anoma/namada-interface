import { Panel } from "@namada/components";
import { LogoFooter } from "App/Layout/LogoFooter";
import { twMerge } from "tailwind-merge";

export const NavigationFooter = ({
  className,
}: {
  className?: string;
}): JSX.Element => {
  return (
    <Panel
      className={twMerge("flex items-center flex-1 justify-center", className)}
    >
      <footer className="w-50 h-10">
        <LogoFooter className="mt-3" />
      </footer>
    </Panel>
  );
};
