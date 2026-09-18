import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, ArrowRight, SkipForward } from 'lucide-react';

export interface ChoiceOption {
  id: number;
  displayName: string;
  name: string;
  isCorrect: boolean;
}

interface ChoiceGridProps {
  options: ChoiceOption[];
  selectedChoiceId: number | null;
  isRevealed: boolean;
  onSelectChoice: (option: ChoiceOption) => void;
  onSkip: () => void;
  onNext: () => void;
  disabled?: boolean;
}

export const ChoiceGrid: React.FC<ChoiceGridProps> = ({
  options,
  selectedChoiceId,
  isRevealed,
  onSelectChoice,
  onSkip,
  onNext,
  disabled = false,
}) => {
  return (
    <div className="w-full h-full flex flex-col justify-between gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Select Pokémon
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          {isRevealed ? 'Round Complete' : '4 Choices'}
        </span>
      </div>

      {/* 4 Multiple Choice Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-h-0">
        {options.map((option, idx) => {
          const isSelected = selectedChoiceId === option.id;
          const showSuccess = isRevealed && option.isCorrect;
          const showError = isRevealed && isSelected && !option.isCorrect;

          let cardClasses =
            'bg-white border-slate-200/90 text-slate-800 hover:border-amber-400 hover:bg-amber-50/25';
          let badgeClasses = 'bg-slate-100 text-slate-600 border-slate-200';

          if (showSuccess) {
            cardClasses =
              'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
            badgeClasses = 'bg-emerald-500 text-white border-emerald-600';
          } else if (showError) {
            cardClasses =
              'bg-rose-50 border-rose-300 text-rose-700 line-through opacity-70';
            badgeClasses = 'bg-rose-500 text-white border-rose-600';
          } else if (isRevealed) {
            cardClasses = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
            badgeClasses = 'bg-slate-200 text-slate-400 border-slate-300';
          }

          return (
            <motion.button
              key={`${option.id}-${idx}`}
              type="button"
              disabled={disabled || isRevealed}
              onClick={() => onSelectChoice(option)}
              whileTap={!isRevealed ? { scale: 0.98 } : undefined}
              className={`relative flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer text-left ${cardClasses} ${
                isRevealed ? 'cursor-default' : ''
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className={`w-7 h-7 rounded-xl border flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${badgeClasses}`}
                >
                  {idx + 1}
                </span>
                <span className="font-bold text-sm sm:text-base tracking-tight truncate">
                  {option.displayName}
                </span>
              </div>

              <div className="shrink-0 ml-2">
                {showSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {showError && <XCircle className="w-5 h-5 text-rose-500" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
        {!isRevealed ? (
          <button
            type="button"
            onClick={onSkip}
            disabled={disabled}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-95 disabled:opacity-50"
          >
            <SkipForward className="w-3.5 h-3.5 text-slate-500" />
            <span>Skip Pokémon</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <span>Next Pokémon</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChoiceGrid;
