import { Modal } from "@namada/components";
import { ModalTransition } from "App/Common/ModalTransition";
import clsx from "clsx";
import { FaChevronLeft } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Advanced } from "./Advanced";
import { CurrencySelector } from "./CurrencySelector";
import { SettingsMain } from "./SettingsMain";
import SettingsRoutes from "./routes";

export const SettingsPanel = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();

  const onClose = (): void => {
    if (location.state?.backgroundLocation) {
      navigate((location.state.backgroundLocation as Location).pathname, {
        replace: true,
      });
    } else {
      navigate("/", { replace: true });
    }
  };

  const onClickBack = (): void => {
    navigate(SettingsRoutes.index(), { state: location.state });
  };

  return (
    <Modal
      onClose={onClose}
      className="left-auto right-4 top-2 translate-x-0 translate-y-0 p-5"
    >
      <ModalTransition
        className={clsx(
          "flex flex-col gap-8",
          "w-[400px] min-h-[700px] max-h-[80vh] rounded-md text-white",
          "bg-rblack border border-neutral-700 p-5"
        )}
      >
        <header className="relative">
          <h1 className="text-center text-md">Settings</h1>
          <button
            onClick={onClose}
            className="absolute right-0 top-0 flex items-center h-full text-2xl hover:text-yellow"
          >
            <IoClose />
          </button>
          {location.pathname !== SettingsRoutes.index() && (
            <button
              className="absolute left-0 top-0 flex items-center h-full text-lg hover:text-yellow"
              onClick={onClickBack}
            >
              <FaChevronLeft />
            </button>
          )}
        </header>
        <Routes>
          <Route index element={<SettingsMain />} />
          <Route
            path={`${SettingsRoutes.currencySelection()}`}
            element={<CurrencySelector />}
          />
          <Route path={`${SettingsRoutes.advanced()}`} element={<Advanced />} />
        </Routes>
      </ModalTransition>
    </Modal>
  );
};
