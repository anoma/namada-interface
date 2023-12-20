import { copyToClipboard } from "@namada/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { GoCheckCircle, GoCopy } from "react-icons/go";

type CopyToClipboardControlIcon = {
  value: string;
  className?: string;
};

export const CopyToClipboardControl = ({
  value,
  className,
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
    <div
      className={className}
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
          <GoCheckCircle />
        </motion.div>
      ) : (
        <GoCopy />
      )}
    </div>
  );
};
