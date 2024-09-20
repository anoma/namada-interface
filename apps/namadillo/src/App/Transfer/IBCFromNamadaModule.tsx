import { TransferModule } from "./TransferModule";

export const IBCFromNamadaModule = (): JSX.Element => {
  return (
    <div>
      <TransferModule isConnected={false} onSubmitTransfer={() => {}} />
    </div>
  );
};
