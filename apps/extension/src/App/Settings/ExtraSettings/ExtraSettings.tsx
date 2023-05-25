import { assertNever } from "@anoma/utils";
import { ExtensionRequester } from "extension";

import { Mode, ExtraSetting } from "./types";
import { ResetPassword } from "./ResetPassword";
import {
  ExtraSettingsContainer,
  CloseLink
} from "./ExtraSettings.components";

/**
 * Container for additional settings forms such as the reset password form.
 */
const ExtraSettings: React.FC<{
  extraSetting: ExtraSetting | null;
  requester: ExtensionRequester;
  onClose: () => void;
}> = ({
  extraSetting,
  requester,
  onClose,
}) => {
  return (
    <ExtraSettingsContainer>
      {extraSetting &&
        <CloseLink onClick={onClose}>
          Close
        </CloseLink>}

      {
        extraSetting === null ? "" :

        extraSetting.mode === Mode.ResetPassword ?
          <ResetPassword
            accountId={extraSetting.accountId}
            requester={requester}
          /> :

        assertNever(extraSetting.mode)
      }
    </ExtraSettingsContainer>
  );
};

export default ExtraSettings;
