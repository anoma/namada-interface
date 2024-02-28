import { Badge } from "@namada/components";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { GoCheckCircleFill, GoXCircleFill } from "react-icons/go";

type Props = {
  children: React.ReactNode;
  successMessage: string;
  errorMessage: string;
  onAction: () => void;
} & React.ComponentPropsWithoutRef<"button">;

export const FeedbackButton = ({
  children,
  successMessage,
  errorMessage,
  onAction,
  ...props
}: Props): JSX.Element => {
  const [displaySuccess, setDisplaySuccess] = useState(false);
  const [displayError, setDisplayError] = useState(false);
  const [feedbackKey, setFeedbackKey] = useState("");
  const timeoutRef = useRef<number>(0);

  const reset = (): void => {
    setDisplaySuccess(false);
    setDisplayError(false);
  };

  const onPerformClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    reset();

    try {
      onAction();
      setDisplaySuccess(true);
    } catch {
      setDisplayError(true);
    }

    setFeedbackKey(`feedback-${new Date().getTime()}`);
  };

  let icon = null;
  if (displaySuccess) icon = <GoCheckCircleFill />;
  if (displayError) icon = <GoXCircleFill />;

  return (
    <div className="relative">
      <button
        onClick={onPerformClick}
        className={clsx(
          "text-white font-medium underline text-xs",
          props.className
        )}
      >
        {children}
      </button>
      <AnimatePresence>
        {(displaySuccess || displayError) && (
          <motion.div
            initial={{
              opacity: 0,
              translateX: "-50%",
              translateY: "0",
            }}
            key={feedbackKey}
            animate={{ opacity: 1, translateY: "-50%" }}
            transition={{ duration: 0.25 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              timeoutRef.current = Number(setTimeout(() => reset(), 2000));
            }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2"
          >
            <Badge
              icon={icon}
              className={clsx({
                "bg-success": displaySuccess,
                "bg-fail": displayError,
              })}
            >
              {displaySuccess && successMessage}
              {displayError && errorMessage}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
