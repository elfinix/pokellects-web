import React from 'react';

interface PokellectsLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  variant?: 'icon' | 'mark';
  className?: string;
  redColor?: string;
  whiteColor?: string;
}

/**
 * Pokellects Official Brand Logo SVG Component
 * Stylized 'P' shaped Pokéball emblem with enhanced optical vertical centering.
 *
 * @param size - width and height in px or css string (default: 32)
 * @param variant - 'icon' (with red rounded rectangle) | 'mark' (transparent emblem only)
 * @param redColor - primary brand red (default: #E60012)
 * @param whiteColor - primary accent white (default: #FFFFFF)
 */
export const PokellectsLogo: React.FC<PokellectsLogoProps> = ({
  size = 32,
  variant = 'icon',
  className = '',
  redColor = '#E60012',
  whiteColor = '#FFFFFF',
  style,
  ...rest
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`shrink-0 select-none block ${variant === 'icon' ? 'rounded-[22%]' : ''} ${className}`}
      style={{
        borderRadius: variant === 'icon' ? '22%' : undefined,
        ...style,
      }}
      aria-label="Pokellects Logo"
      {...rest}
    >
      {/* Red Rounded Rectangle Canvas Background */}
      {variant === 'icon' && (
        <rect width="512" height="512" rx="112" fill={redColor} />
      )}

      {/* Outer 'P' Silhouette with Inner Cutout — Optically Centered Upward */}
      <path
        fill={whiteColor}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 114 238
           A 142 142 0 1 1 184 360
           L 184 370
           A 35 35 0 0 1 114 370
           L 114 238 Z
           M 256 134
           A 104 104 0 1 0 256 342
           A 104 104 0 1 0 256 134 Z"
      />

      {/* Inner Pokéball White Disc */}
      <circle cx="256" cy="238" r="86" fill={whiteColor} />

      {/* Pokéball Center Horizontal Red Belt */}
      <rect x="170" y="230" width="172" height="16" fill={variant === 'icon' ? redColor : '#E60012'} />

      {/* Pokéball Center Outer Red Ring */}
      <circle cx="256" cy="238" r="35" fill={variant === 'icon' ? redColor : '#E60012'} />

      {/* Pokéball Center White Button */}
      <circle cx="256" cy="238" r="21" fill={whiteColor} />

      {/* Pokéball Center Red Core Dot */}
      <circle cx="256" cy="238" r="11" fill={variant === 'icon' ? redColor : '#E60012'} />
    </svg>
  );
};

export default PokellectsLogo;
