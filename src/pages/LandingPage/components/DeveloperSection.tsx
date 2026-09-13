import React from 'react';
import { motion } from 'motion/react';

export const DeveloperSection: React.FC = () => {
  return (
    <section id="developer" className="scroll-mt-16 py-20 bg-white border-t border-slate-200 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Section Header with Motion Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-2"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-red-600">
            Behind the Project
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 font-display">
            Meet the Developer
          </h2>
          <p className="text-slate-500 text-sm">
            Built out of passion for Pokémon knowledge and thoughtful web design.
          </p>
        </motion.div>

        {/* Profile Card with Depth and Subtle Hover Lift */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
          className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-shadow flex flex-col sm:flex-row items-center gap-6 cursor-default"
        >
          <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-display font-black text-2xl shrink-0 shadow-sm">
            DEV
          </div>

          <div className="space-y-3 text-center sm:text-left flex-1">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-display">
                Pokellects Creator
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Lifelong Pokémon Fan & Software Developer
              </p>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              "I wanted to create a platform where testing your Pokémon memory feels genuinely
              rewarding. Instead of a temporary quiz score that disappears when you leave the page,
              Pokellects is designed as a persistent, keyboard-first Pokédex companion that grows with
              you."
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DeveloperSection;
