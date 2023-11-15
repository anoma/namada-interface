import { Icon, IconName } from "@namada/components";
import { copyToClipboard } from "@namada/utils";
import { IconContainer } from "../input.components";
import { useState } from "react";
import { motion } from "framer-motion";

type CopyToClipboardControlIcon = {
  value: string;
};

export const CopyToClipboardControl = ({
  value,
}: CopyToClipboardControlIcon): JSX.Element => {
  const [copied, setCopied] = useState(false);

  const showConfirmation = (): void => {
    const timeInMiliseconds = 3000;
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, timeInMiliseconds);
  };

  const onClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    if (copied) return;
    copyToClipboard(value || "");
    showConfirmation();
  };

  return (
    <IconContainer
      role="button"
      aria-labelledby="Copy to clipboard"
      onClick={onClick}
    >
      {copied ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          <Icon iconName={IconName.Checked} />
        </motion.div>
      ) : (
        <Icon iconName={IconName.Copy} />
      )}
    </IconContainer>
  );
};
