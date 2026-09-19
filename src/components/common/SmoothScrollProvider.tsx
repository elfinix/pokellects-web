import React from 'react';
import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({ children }) => {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.15,
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 0,
        infinite: false,
        anchors: false,
      }}
    >
      {children}
    </ReactLenis>
  );
};

export default SmoothScrollProvider;
