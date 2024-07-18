import { FaCode, FaTimes } from "react-icons/fa";

type ApprovalPanelHeaderProps = {
  numberOfTransactions: number;
  viewTransactionData: boolean;
  onChangeViewData: (display: boolean) => void;
};

export const ApprovalPanelHeader = ({
  numberOfTransactions,
  viewTransactionData: displayTransaction,
  onChangeViewData,
}: ApprovalPanelHeaderProps): JSX.Element => {
  return (
    <header className="flex w-full items-center justify-between text-sm mb-2">
      <div>
        <i className="text-yellow not-italic">{numberOfTransactions}</i>{" "}
        {numberOfTransactions === 1 ? "Message" : "Messages"}
      </div>
      <button
        className="flex items-center gap-1 hover:text-yellow"
        onClick={() => onChangeViewData(!displayTransaction)}
      >
        {displayTransaction ?
          <>
            Hide Data <FaTimes />
          </>
        : <>
            View Data <FaCode />
          </>
        }
      </button>
    </header>
  );
};
