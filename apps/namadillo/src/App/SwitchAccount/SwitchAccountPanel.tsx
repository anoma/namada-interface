import { Checkbox, Modal } from "@namada/components";
import { ModalTransition } from "App/Common/ModalTransition";
import {
  accountsAtom,
  defaultAccountAtom,
  updateDefaultAccountAtom,
} from "atoms/accounts";
import clsx from "clsx";
import { useModalCloseEvent } from "hooks/useModalCloseEvent";
import { useAtomValue } from "jotai";
import { IoClose } from "react-icons/io5";
import { twMerge } from "tailwind-merge";

export const SwitchAccountPanel = (): JSX.Element => {
  const { onCloseModal } = useModalCloseEvent();
  const { data: defaultAccount } = useAtomValue(defaultAccountAtom);
  const { data } = useAtomValue(accountsAtom);
  const { mutateAsync: updateAccount } = useAtomValue(updateDefaultAccountAtom);

  return (
    <Modal
      onClose={onCloseModal}
      className={clsx(
        "w-full left-auto right-0 top-0 translate-x-0 translate-y-0",
        "translate-y-0 pointer-events-none"
      )}
    >
      <ModalTransition className="custom-container sm:p-5">
        <div
          className={clsx(
            "flex flex-col gap-8 ml-auto pointer-events-auto",
            "w-fit max-w-[400px] rounded-md text-white h-full",
            "bg-rblack border border-neutral-700 p-5"
          )}
        >
          <header className="relative">
            <h1 className="text-center text-md px-15">Switch Account</h1>
            <button
              onClick={onCloseModal}
              className="absolute right-0 top-0 flex items-center h-full text-2xl hover:text-yellow"
            >
              <IoClose />
            </button>
          </header>
          <div className="overflow-auto dark-scrollbar pb-5">
            {data
              ?.filter((i) => !i.isShielded)
              .map(({ alias, address }) => (
                <button
                  key={alias}
                  className={twMerge(
                    "flex gap-2 w-full py-1",
                    "whitespace-nowrap text-left",
                    "cursor-pointer hover:text-yellow transition-colors",
                    address === defaultAccount?.address && "text-yellow"
                  )}
                  onClick={async () => {
                    updateAccount(address);
                    onCloseModal();
                  }}
                >
                  <span className="text-yellow">
                    <Checkbox
                      checked={address === defaultAccount?.address}
                      readOnly
                    />
                  </span>
                  <span className="text-ellipsis overflow-hidden" title={alias}>
                    {alias}
                  </span>
                </button>
              ))}
          </div>
        </div>
      </ModalTransition>
    </Modal>
  );
};
