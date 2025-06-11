import { routes } from "App/routes";
import clsx from "clsx";
import { useMemo } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";

export const IbcTabNavigation = (): JSX.Element => {
  const location = useLocation();

  const activeTab = useMemo(() => {
    const isWithdraw = matchPath(routes.ibcWithdraw, location.pathname);
    if (isWithdraw) return "withdraw";

    const isTransfer = matchPath(routes.ibc, location.pathname);
    if (isTransfer) return "deposit";

    throw "Unknown IBC tab";
  }, [location]);

  const tabs: Array<{
    key: typeof activeTab;
    text: React.ReactNode;
    url: string;
  }> = [
    {
      key: "deposit",
      text: "Deposit",
      url: routes.ibc,
    },
    {
      key: "withdraw",
      text: "Withdraw",
      url: routes.ibcWithdraw,
    },
  ];

  return (
    <nav className="w-full">
      <ul className="w-full max-w-[320px] flex mx-auto">
        {tabs.map((tab) => (
          <li key={tab.key} className="flex-1 text-center">
            <Link
              to={tab.url}
              className={`group w-full px-4 py-2 cursor-pointer ${
                activeTab === tab.key ?
                  "text-yellow"
                : "text-gray-700 text-white"
              }`}
            >
              <span
                className={clsx(
                  "transition-colors duration-100 border-b border-transparent",
                  "group-hover:border-current",
                  activeTab === tab.key && "!border-current"
                )}
              >
                {tab.text}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
