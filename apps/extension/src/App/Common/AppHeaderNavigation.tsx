import { Stack } from "@namada/components";
import routes from "App/routes";
import clsx from "clsx";
import { useVaultContext } from "context";
import { FaDiscord, FaXTwitter } from "react-icons/fa6";
import { GoQuestion } from "react-icons/go";
import { useNavigate } from "react-router-dom";

type AppHeaderNavigationProps = {
  open: boolean;
  onClose: () => void;
};

export const AppHeaderNavigation = ({
  open,
  onClose,
}: AppHeaderNavigationProps): JSX.Element => {
  const { lock } = useVaultContext();
  const navigate = useNavigate();

  const onClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onClose();
  };

  const goTo = (callback: () => string): void => {
    navigate(callback());
    onClose();
  };

  const onLock = (): void => {
    lock();
    onClose();
  };

  const listItemClassList = clsx(
    "relative cursor-pointer text-yellow-800 transition-colors duration-100",
    "ease-out hover:text-black active:top-px"
  );

  return (
    <>
      <nav
        className={clsx(
          "bg-yellow text-yellow-800 h-full fixed pt-16 px-6 pb-8 right-0 top-0",
          "transition-all duration-[600ms] w-[65%] z-50 translate-x-full ease-out-expo",
          { "!translate-x-0": open }
        )}
      >
        <i
          className={clsx(
            "text-[1.85em] cursor-pointer leading-[0] absolute right-0 px-5 py-8 not-italic",
            "top-0 transition-colors duration-100 ease-out select-none hover:text-black active:top-px"
          )}
          role="button"
          aria-label="Close menu"
          onClick={onClick}
        >
          &#x2715;
        </i>
        <div className="flex flex-col flex-1 h-full justify-between">
          <Stack gap={4} as="ul" className={clsx("text-xl select-none")}>
            <li
              className={listItemClassList}
              onClick={() => goTo(routes.changePassword)}
            >
              Change Password
            </li>
            <li
              className={listItemClassList}
              onClick={() => goTo(routes.connectedSites)}
            >
              Connected Sites
            </li>
            <li
              className={listItemClassList}
              onClick={() => goTo(routes.network)}
            >
              Network
            </li>
            <li className={listItemClassList} onClick={onLock}>
              Lock Wallet
            </li>
          </Stack>
          <footer className="flex items-center justify-between text-yellow-950 text-2xl">
            <Stack
              as="ul"
              gap={4}
              direction="horizontal"
              className="items-center"
            >
              <a
                href="https://discord.com/invite/namada"
                target="_blank"
                className="transition-colors text-[1.15em] hover:text-cyan"
                rel="noreferrer nofollow"
              >
                <FaDiscord />
              </a>
              <a
                href="https://twitter.com/namada"
                target="_blank"
                className="transition-colors hover:text-cyan"
                rel="noreferrer nofollow"
              >
                <FaXTwitter />
              </a>
            </Stack>
            <a
              href="https://discord.com/channels/833618405537218590/1074984397599678534"
              target="_blank"
              className="transition-colors hover:text-cyan"
              rel="noreferrer nofollow"
            >
              <GoQuestion />
            </a>
          </footer>
        </div>
      </nav>
      {open && (
        <div
          className={clsx(
            "animate-fade-in bg-black/50 cursor-pointer h-full",
            "left-0 fixed top-0 w-full z-40 last:self-end"
          )}
          onClick={onClick}
        />
      )}
    </>
  );
};
