import { assertNever } from "@namada/utils";
import { ExtensionRequester } from "extension";

import { Mode, ExtraSetting } from "./types";
import { ResetPassword } from "./ResetPassword";
import { DeleteAccount } from "./DeleteAccount";
import { ExtraSettingsContainer, CloseLink } from "./ExtraSettings.components";

/**
 * Container for additional settings forms such as the reset password form.
 */
const ExtraSettings: React.FC<{
  extraSetting: ExtraSetting | null;
  requester: ExtensionRequester;
  onClose: () => void;
  onDeleteAccount: (id: string) => void;
}> = ({ extraSetting, requester, onClose, onDeleteAccount }) => {
  return (
    <ExtraSettingsContainer>
      {extraSetting && <CloseLink onClick={onClose}>Close</CloseLink>}

      {extraSetting === null ? (
        ""
      ) : extraSetting.mode === Mode.ResetPassword ? (
        <ResetPassword
          accountId={extraSetting.accountId}
          requester={requester}
        />
      ) : extraSetting.mode === Mode.DeleteAccount ? (
        <DeleteAccount
          accountId={extraSetting.accountId}
          requester={requester}
          onDeleteAccount={onDeleteAccount}
        />
      ) : (
        assertNever(extraSetting.mode)
      )}
    </ExtraSettingsContainer>
  );
};

export default ExtraSettings;
