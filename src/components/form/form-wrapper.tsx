import { motion } from "framer-motion";

export function FormStepWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          x: -50,
        },
        visible: {
          opacity: 1,
          x: 0,
        },
        exit: {
          opacity: 0,
          x: 50,
          transition: {
            ease: "easeOut",
          },
        },
      }}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
