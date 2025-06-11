import clsx from "clsx";
import { IoClose } from "react-icons/io5";
import { PiWarning } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

import { Modal, Stack } from "@namada/components";
import routes from "App/routes";
import updateRequried from "./assets/update-required.png";

export const UpdateRequired = (): JSX.Element => {
  const navigate = useNavigate();

  const onCloseModal = (): void => {
    navigate(routes.viewAccountList());
  };

  return (
    <Modal
      onClose={onCloseModal}
      className={clsx(
        "w-full left-auto right-0 top-0 bottom-0 translate-x-0",
        "translate-y-0 pointer-events-none",
        "p-5"
      )}
    >
      <div
        className={clsx(
          "flex flex-col pointer-events-auto",
          "w-full h-full",
          "bg-black border rounded-md border-yellow-300 p-3"
        )}
      >
        <header className="relative">
          <button
            onClick={onCloseModal}
            className="absolute right-0 top-3 flex items-center h-full text-2xl text-white hover:text-yellow"
          >
            <IoClose />
          </button>
        </header>
        <div className="flex flex-1">
          <Stack className="px-5">
            <Stack gap={1}>
              <img
                src={updateRequried}
                alt=""
                className="w-[108px] self-center mt-2"
              />
              <h1 className="text-white text-center text-md">
                Account update required!
              </h1>
            </Stack>
            <p className="text-yellow text-center">
              Accounts marked with an exclamation symbol
              <br />
              <span className="font-md">
                (<PiWarning className="inline w-[14px] h-[14px]" />){" "}
              </span>
              need to be re-imported to support shielded transfers.*
            </p>
            <Stack className="p-5 rounded-md bg-neutral-900 text-white" gap={2}>
              <h2 className="font-medium">To Re-import your account:</h2>
              <ol className="list-decimal pl-3 pr-1 space-y-2">
                <li>
                  If necessary. Re-copy and note down your seed phrase / private
                  key
                  <br />
                  <span className="text-yellow">
                    Accounts CAN NOT be re-imported without the seed phrase
                  </span>
                </li>
                <li>Delete the marked account from  the keychain</li>
                <li>
                  Re-Import the account using your seed phrase / private key /
                  Ledger HW wallet
                </li>
              </ol>
            </Stack>
          </Stack>
        </div>
      </div>
    </Modal>
  );
};
