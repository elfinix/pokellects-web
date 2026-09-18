import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PokeBallHoverDialogProps {
  isVisible: boolean;
}

export const PokeBallHoverDialog: React.FC<PokeBallHoverDialogProps> = ({
  isVisible,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none"
        >
          {/* Light/Dark-colored small dialog pill */}
          <div className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-md text-slate-700 dark:text-slate-200 text-xs font-semibold whitespace-nowrap">
            {/* Upward pointer caret towards Pokéball */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-slate-900 border-t border-l border-slate-200/90 dark:border-slate-800 rotate-45" />

            {/* Red live pulse dot */}
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />

            <span>Click the Pokéball!</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PokeBallHoverDialog;
