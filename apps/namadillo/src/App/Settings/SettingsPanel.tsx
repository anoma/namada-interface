import { Modal } from "@namada/components";
import { ModalTransition } from "App/Common/ModalTransition";
import clsx from "clsx";
import { useModalCloseEvent } from "hooks/useModalCloseEvent";
import { FaChevronLeft } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Advanced } from "./Advanced";
import { SettingsMain } from "./SettingsMain";
import { SettingsSignArbitrary } from "./SettingsSignArbitrary";
import SettingsRoutes from "./routes";

export const SettingsPanel = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const { onCloseModal } = useModalCloseEvent();

  const onClickBack = (): void => {
    navigate(SettingsRoutes.index(), { state: location.state });
  };

  return (
    <Modal
      onClose={onCloseModal}
      className={clsx(
        "w-full left-auto right-0 top-0 translate-x-0",
        "translate-y-0 pointer-events-none"
      )}
    >
      <ModalTransition className="custom-container h-[min(700px,_100vh)] sm:p-5">
        <div
          className={clsx(
            "flex flex-col gap-8 ml-auto pointer-events-auto",
            "max-w-[400px] rounded-md text-white h-full",
            "bg-rblack border border-neutral-700 p-5"
          )}
        >
          <header className="relative">
            <h1 className="text-center text-md">Settings</h1>
            <button
              onClick={onCloseModal}
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
          <div className="flex flex-1 overflow-auto dark-scrollbar">
            <Routes>
              <Route index element={<SettingsMain />} />
              <Route
                path={`${SettingsRoutes.signArbitrary()}`}
                element={<SettingsSignArbitrary />}
              />
              <Route
                path={`${SettingsRoutes.advanced()}`}
                element={<Advanced />}
              />
            </Routes>
          </div>
        </div>
      </ModalTransition>
    </Modal>
  );
};
