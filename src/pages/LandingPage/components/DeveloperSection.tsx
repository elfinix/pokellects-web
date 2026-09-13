import React from 'react';

export const DeveloperSection: React.FC = () => {
  return (
    <section id="developer" className="py-20 bg-white border-t border-slate-200 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-red-600">
            Behind the Project
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 font-display">
            Meet the Developer
          </h2>
          <p className="text-slate-500 text-sm">
            Built out of passion for Pokémon knowledge and thoughtful web design.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
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
        </div>
      </div>
    </section>
  );
};

export default DeveloperSection;
