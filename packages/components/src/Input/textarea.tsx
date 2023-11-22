import { ContentMasker } from "@namada/components";
import {
  ErrorTooltip,
  HintTooltip,
  InputWrapper,
  Label,
  LabelWrapper,
  TextAreaInput,
} from "./input.components";

import { ComponentProps, TextareaProps } from "./types";
import { CopyToClipboardControl } from "./CopyToClipboardControl/CopyToClipboardControl";

type Props = ComponentProps &
  TextareaProps & { rows?: number; copyToClipboard?: boolean };

export const Textarea = ({
  label,
  error,
  hint,
  theme,
  rows = 3,
  sensitive = false,
  copyToClipboard = false,
  ...props
}: Props): JSX.Element => {
  const field = (
    <TextAreaInput rows={rows} error={!!error} inputTheme={theme} {...props} />
  );

  return (
    <Label>
      {label && <LabelWrapper>{label}</LabelWrapper>}
      <InputWrapper>
        {sensitive ? (
          <ContentMasker themeColor={theme}>{field}</ContentMasker>
        ) : (
          field
        )}

        {copyToClipboard && <CopyToClipboardControl value={props.value + ""} />}
      </InputWrapper>
      {<ErrorTooltip>{error}</ErrorTooltip>}
      {<HintTooltip>{hint}</HintTooltip>}
    </Label>
  );
};
