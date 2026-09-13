import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

interface PeekingSquadProps {
  isActive: boolean;
}

interface PeekingMon {
  id: number;
  name: string;
  spriteUrl: string;
  initial: { x?: string; y?: string; rotate: number; scale?: number };
  animate: { x?: string; y?: string; rotate: number; scale?: number };
  exit: { x?: string; y?: string; rotate: number; scale?: number };
  className: string;
  flipX?: boolean;
}

const SQUAD: PeekingMon[] = [
  // 1. Bulbasaur - peeking up from bottom-left
  {
    id: 1,
    name: 'Bulbasaur',
    spriteUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
    initial: { y: '105%', x: '-15%', rotate: 16, scale: 0.9 },
    animate: { y: '18%', x: '0%', rotate: 8, scale: 1 },
    exit: { y: '105%', x: '-15%', rotate: 16, scale: 0.9 },
    className:
      'fixed bottom-0 left-4 sm:left-14 w-32 h-32 sm:w-44 sm:h-44 z-[99999] pointer-events-none',
  },
  // 2. Squirtle - peeking from left edge, flipped horizontally to face screen center
  {
    id: 7,
    name: 'Squirtle',
    spriteUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
    initial: { x: '-105%', y: '0%', rotate: -18, scale: 0.9 },
    animate: { x: '-12%', y: '0%', rotate: -8, scale: 1 },
    exit: { x: '-105%', y: '0%', rotate: -18, scale: 0.9 },
    className:
      'fixed top-1/3 left-0 w-32 h-32 sm:w-40 sm:h-40 z-[99999] pointer-events-none',
    flipX: true,
  },
  // 3. Charmander - peeking from right edge
  {
    id: 4,
    name: 'Charmander',
    spriteUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
    initial: { x: '105%', y: '0%', rotate: 18, scale: 0.9 },
    animate: { x: '12%', y: '0%', rotate: 8, scale: 1 },
    exit: { x: '105%', y: '0%', rotate: 18, scale: 0.9 },
    className:
      'fixed top-1/2 right-0 w-32 h-32 sm:w-40 sm:h-40 z-[99999] pointer-events-none',
  },
  // 4. Mew - floating down from top-right, safely positioned away from header CTA buttons
  {
    id: 151,
    name: 'Mew',
    spriteUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png',
    initial: { y: '-105%', x: '10%', rotate: -22, scale: 0.9 },
    animate: { y: '-10%', x: '0%', rotate: -12, scale: 1 },
    exit: { y: '-105%', x: '10%', rotate: -22, scale: 0.9 },
    className:
      'fixed top-0 right-48 sm:right-64 md:right-80 lg:right-96 w-32 h-32 sm:w-40 sm:h-40 z-[99999] pointer-events-none',
  },
  // 5. Pikachu - popping up cheerfully from bottom-right
  {
    id: 25,
    name: 'Pikachu',
    spriteUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    initial: { y: '105%', x: '15%', rotate: -14, scale: 0.9 },
    animate: { y: '14%', x: '0%', rotate: -6, scale: 1 },
    exit: { y: '105%', x: '15%', rotate: -14, scale: 0.9 },
    className:
      'fixed bottom-0 right-4 sm:right-20 w-36 h-36 sm:w-48 sm:h-48 z-[99999] pointer-events-none',
  },
];

export const PeekingSquad: React.FC<PeekingSquadProps> = ({ isActive }) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden select-none">
          {SQUAD.map((mon, index) => (
            <motion.div
              key={mon.id}
              className={mon.className}
              initial={mon.initial}
              animate={mon.animate}
              exit={mon.exit}
              transition={{
                type: 'spring',
                stiffness: 320,
                damping: 22,
                delay: index * 0.03,
              }}
            >
              <div
                className="w-full h-full"
                style={mon.flipX ? { transform: 'scaleX(-1)' } : undefined}
              >
                <motion.img
                  src={mon.spriteUrl}
                  alt={mon.name}
                  className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.25)]"
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, index % 2 === 0 ? 1.5 : -1.5, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.8 + index * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default PeekingSquad;
