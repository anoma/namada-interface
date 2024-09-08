import { Modal } from "@namada/components";
import { ModalTransition } from "App/Common/ModalTransition";
import { accountsAtom, updateDefaultAccountAtom } from "atoms/accounts";
import clsx from "clsx";
import { useModalCloseEvent } from "hooks/useModalCloseEvent";
import { useAtomValue } from "jotai";
import { IoClose } from "react-icons/io5";
import { twMerge } from "tailwind-merge";

export const SwitchAccountModal = (): JSX.Element => {
  const { onCloseModal } = useModalCloseEvent();
  const { data } = useAtomValue(accountsAtom);
  const { mutateAsync: updateAccount } = useAtomValue(updateDefaultAccountAtom);

  return (
    <Modal onClose={onCloseModal}>
      <ModalTransition className="custom-container h-[min(700px,_100vh)] sm:p-5">
        <div
          className={clsx(
            "flex flex-col gap-8 ml-auto pointer-events-auto",
            "max-w-[400px] rounded-md text-white h-full",
            "bg-rblack border border-neutral-700 p-5"
          )}
        >
          <header className="relative">
            <h1 className="text-center text-md pr-10">Switch Account</h1>
            <button
              onClick={onCloseModal}
              className="absolute right-0 top-0 flex items-center h-full text-2xl hover:text-yellow"
            >
              <IoClose />
            </button>
          </header>
          <div className="overflow-auto dark-scrollbar">
            {data
              ?.filter((i) => !i.isShielded)
              .map(({ alias, address }) => (
                <button
                  key={alias}
                  className={twMerge(
                    "block w-full py-1 px-2",
                    "whitespace-nowrap text-left",
                    "cursor-pointer hover:text-yellow transition-colors"
                  )}
                  onClick={async () => {
                    updateAccount(address);
                    onCloseModal();
                  }}
                >
                  {alias}
                </button>
              ))}
          </div>
        </div>
      </ModalTransition>
    </Modal>
  );
};
