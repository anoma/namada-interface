import { copyToClipboard } from "@namada/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { GoCheckCircle, GoCopy } from "react-icons/go";
import { twMerge } from "tailwind-merge";

type CopyToClipboardControlIcon = {
  value: string;
  className?: string;
  children?: React.ReactNode;
};

export const CopyToClipboardControl = ({
  value,
  className,
  children,
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
      className={twMerge(
        "relative flex items-center gap-2 active:top-px",
        className
      )}
      role="button"
      aria-labelledby="Copy to clipboard"
      onClick={onClick}
    >
      {children}
      {copied ?
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          <GoCheckCircle />
        </motion.div>
      : <GoCopy />}
    </div>
  );
};
