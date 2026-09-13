import React from 'react';
import { BookOpen, Search, Gamepad2 } from 'lucide-react';
import { motion } from 'motion/react';

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="scroll-mt-16 py-20 bg-white/75 backdrop-blur-xs border-y border-slate-200/80 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header with Viewport Entrance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-red-600">
            The Pokellects Experience
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
            A Pokédex That Never Resets
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Standard trivia games reset with every reload. Pokellects gives your knowledge permanence,
            turning identification and memory into a persistent, rewarding archive.
          </p>
        </motion.div>

        {/* 3 Interactive Cards with Staggered Entrance and Tactile Elevation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 1. Personal Collection Ledger */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            whileHover={{ y: -4, transition: { duration: 0.22, ease: 'easeOut' } }}
            className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-shadow space-y-4 cursor-default"
          >
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Personal Collection Ledger</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Track completion progress across the National Pokédex. Unlocked Pokémon appear in full
              vibrant detail, while undiscovered entries challenge you to complete the roster.
            </p>
          </motion.div>

          {/* 2. Continuous Fast Input */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            whileHover={{ y: -4, transition: { duration: 0.22, ease: 'easeOut' } }}
            className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-shadow space-y-4 cursor-default"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Continuous Fast Input</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Streamlined for speed. Type a Pokémon’s name in the floating bar, inspect its entry,
              then hit <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 text-xs font-sans">Esc</kbd> to return immediately to the input bar.
            </p>
          </motion.div>

          {/* 3. Arena-Driven Discovery */}
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            whileHover={{ y: -4, transition: { duration: 0.22, ease: 'easeOut' } }}
            className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-shadow space-y-4 cursor-default"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Arena-Driven Discovery</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every victory in the Arena registers a brand new Pokémon directly into your ledger.
              The game specifically selects species you haven’t discovered yet.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
