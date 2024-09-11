import { HTMLMotionProps, motion } from "framer-motion";
import { easings } from "utils/animations";

type ModalTransitionProps = {
  children: React.ReactNode;
} & HTMLMotionProps<"div">;

export const ModalTransition = ({
  children,
  ...props
}: ModalTransitionProps): JSX.Element => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: easings.expoOut }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
