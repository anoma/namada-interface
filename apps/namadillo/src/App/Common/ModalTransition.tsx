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
      key="modal-transition"
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { duration: 0.15, ease: easings.quartOut },
      }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
