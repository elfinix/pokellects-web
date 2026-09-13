import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

const FLOATING_MOTES = [
  { id: 1, left: '12%', size: 3, duration: 18, delay: 0, color: 'bg-red-400/50' },
  { id: 2, left: '28%', size: 2.5, duration: 24, delay: 4, color: 'bg-indigo-400/40' },
  { id: 3, left: '46%', size: 3.5, duration: 20, delay: 2, color: 'bg-rose-400/45' },
  { id: 4, left: '68%', size: 2, duration: 26, delay: 6, color: 'bg-amber-400/40' },
  { id: 5, left: '84%', size: 3, duration: 22, delay: 1, color: 'bg-red-400/45' },
  { id: 6, left: '92%', size: 2, duration: 25, delay: 8, color: 'bg-purple-400/40' },
];

export const BackgroundSystem: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  // Damped spring physics for smooth, organic cursor trailing
  const springConfig = { damping: 26, stiffness: 190, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
      {/* 1. Interactive Cursor-Following Luminous Aurora (Layered for Depth & Presence) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none transition-opacity duration-300"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
          willChange: 'transform, opacity',
        }}
      >
        {/* Broad ambient aura */}
        <div
          className="w-[560px] h-[560px] rounded-full blur-[95px]"
          style={{
            background:
              'radial-gradient(circle, rgba(239, 68, 68, 0.075) 0%, rgba(244, 63, 94, 0.055) 35%, rgba(99, 102, 241, 0.04) 65%, transparent 78%)',
          }}
        />

        {/* Focused inner warm glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full blur-[60px]"
          style={{
            background:
              'radial-gradient(circle, rgba(239, 68, 68, 0.085) 0%, rgba(251, 113, 133, 0.05) 50%, transparent 72%)',
          }}
        />
      </motion.div>

      {/* 2. Precision Studio Micro-Grid with Elliptical Radial Falloff Mask */}
      <div
        className="absolute inset-0 opacity-[0.38]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(15, 23, 42, 0.14) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage:
            'radial-gradient(ellipse 75% 65% at 50% 35%, #000 25%, transparent 85%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 75% 65% at 50% 35%, #000 25%, transparent 85%)',
        }}
      />

      {/* 3. Persistent Atmospheric Aurora Lighting Blooms */}
      {/* Top Hero Crimson/Coral Bloom */}
      <div className="absolute -top-24 right-1/4 w-[600px] h-[600px] rounded-full bg-red-400/12 blur-[140px] pointer-events-none" />

      {/* Top-Left Subtle Indigo Counterpoint */}
      <div className="absolute top-1/6 -left-20 w-[520px] h-[520px] rounded-full bg-indigo-300/10 blur-[130px] pointer-events-none" />

      {/* Mid-Page Warm Amber Core (Minigame Arena Aura) */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 w-[650px] h-[650px] rounded-full bg-amber-400/8 blur-[150px] pointer-events-none" />

      {/* Bottom Subtle Slate/Indigo Depth */}
      <div className="absolute bottom-10 right-1/6 w-[480px] h-[480px] rounded-full bg-indigo-400/8 blur-[140px] pointer-events-none" />

      {/* 4. Ambient Energy Motes (Slow Drifting Stardust) */}
      <div className="absolute inset-0">
        {FLOATING_MOTES.map((mote) => (
          <motion.div
            key={mote.id}
            className={`absolute rounded-full ${mote.color} blur-[0.5px]`}
            style={{
              left: mote.left,
              bottom: '-20px',
              width: `${mote.size}px`,
              height: `${mote.size}px`,
            }}
            animate={{
              y: ['0vh', '-105vh'],
              opacity: [0, 0.7, 0.7, 0],
            }}
            transition={{
              duration: mote.duration,
              repeat: Infinity,
              ease: 'linear',
              delay: mote.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default BackgroundSystem;
