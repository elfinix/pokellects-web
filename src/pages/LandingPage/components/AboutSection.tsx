import React from 'react';
import { BookOpen, Search, Gamepad2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white border-y border-slate-200 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 1. Personal Collection Ledger */}
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Personal Collection Ledger</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Track completion progress across the National Pokédex. Unlocked Pokémon appear in full
              vibrant detail, while undiscovered entries challenge you to complete the roster.
            </p>
          </div>

          {/* 2. Continuous Fast Input */}
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Continuous Fast Input</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Streamlined for speed. Type a Pokémon’s name in the floating bar, inspect its entry,
              then hit <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 text-xs font-sans">Esc</kbd> to return immediately to the input bar.
            </p>
          </div>

          {/* 3. Arena-Driven Discovery */}
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Arena-Driven Discovery</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every victory in the Arena registers a brand new Pokémon directly into your ledger.
              The game specifically selects species you haven’t discovered yet.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
