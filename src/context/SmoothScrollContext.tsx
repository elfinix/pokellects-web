import React, { createContext, useContext, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollToTop: (immediate?: boolean) => void;
  stopScroll: () => void;
  startScroll: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollToTop: () => {},
  stopScroll: () => {},
  startScroll: () => {},
});

// Singleton reference for global helper utilities
let globalLenisInstance: Lenis | null = null;

export const getGlobalLenis = (): Lenis | null => globalLenisInstance;

export const globalScrollToTop = (immediate = true) => {
  if (globalLenisInstance) {
    globalLenisInstance.scrollTo(0, { immediate });
  }
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, left: 0, behavior: immediate ? 'instant' : 'smooth' });
  }
};

export const globalStopScroll = () => {
  globalLenisInstance?.stop();
};

export const globalStartScroll = () => {
  globalLenisInstance?.start();
};

export const SmoothScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration curve
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 0,
    });

    lenisRef.current = lenis;
    globalLenisInstance = lenis;

    let animationFrameId: number;

    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      lenisRef.current = null;
      globalLenisInstance = null;
    };
  }, []);

  const scrollToTop = (immediate = true) => {
    globalScrollToTop(immediate);
  };

  const stopScroll = () => {
    globalStopScroll();
  };

  const startScroll = () => {
    globalStartScroll();
  };

  return (
    <SmoothScrollContext.Provider
      value={{
        lenis: lenisRef.current,
        scrollToTop,
        stopScroll,
        startScroll,
      }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
};

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export default SmoothScrollProvider;
