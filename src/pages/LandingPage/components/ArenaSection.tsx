import React from 'react';
import { Eye, Type, Volume2, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export const ArenaSection: React.FC = () => {
  return (
    <section id="arena" className="scroll-mt-16 py-16 sm:py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Centered Section Header with Motion Entrance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-red-600">
            Minigame Arena
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
            Battle Arena Challenges
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Every game round is drawn exclusively from Pokémon you have not yet unlocked.
            Win the challenge to register that species directly into your Pokédex.
          </p>
        </motion.div>

        {/* Clean, Polished Minigame Cards with Staggered Entrance and Hover Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Who's That Pokémon */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between cursor-default"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  Silhouette
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Who's That Pokémon?</h3>
                <p className="text-xs text-slate-500 mt-1">Visual Recognition</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Identify the shadowy silhouette against a 15-second timer. Use optional generation
                and type hints to secure the unlock before time runs out.
              </p>
            </div>
            <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Timer: 15s</span>
              <span className="font-medium text-slate-700">3 Attempts</span>
            </div>
          </motion.div>

          {/* 2. Hangmon */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between cursor-default"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Type className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  Word Puzzle
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Hangmon</h3>
                <p className="text-xs text-slate-500 mt-1">Letter Deduction</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Solve the concealed Pokémon name letter-by-letter. Rely on category cues and word
                length before reaching maximum strikes.
              </p>
            </div>
            <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Strikes: 6</span>
              <span className="font-medium text-slate-700">Category Hint</span>
            </div>
          </motion.div>

          {/* 3. Identicry */}
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between cursor-default"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Volume2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  Audio Cry
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Identicry</h3>
                <p className="text-xs text-slate-500 mt-1">Acoustic Training</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Listen to the authentic Pokémon sound cry and select the matching species from four
                choices. Replays are limited to test auditory memory.
              </p>
            </div>
            <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>3 Audio Replays</span>
              <span className="font-medium text-slate-700">4 Choices</span>
            </div>
          </motion.div>

          {/* 4. Pokédle (Coming Soon) */}
          <motion.div
            custom={3}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 flex flex-col justify-between cursor-default"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md">
                  Coming Soon
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Pokédle</h3>
                <p className="text-xs text-slate-400 mt-1">Multi-Criteria Deduction</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Deduce the secret Pokémon using feedback on primary/secondary types, height, weight,
                generation, and evolution stage.
              </p>
            </div>
            <div className="pt-4 mt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
              <span>In Development</span>
              <span className="font-medium">Future Update</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ArenaSection;
