import React from 'react';

type Props = {
  src: string;
  alt?: string;
  side?: 'left' | 'right';
  width?: number | string;
  height?: number | string;
  className?: string;
  decorative?: boolean; // if true, aria-hidden
  // Blend mode to use when tinting the image. One of Tailwind's mix-blend-* supported values.
  blend?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten';
  // Optional CSS color (hex, rgba, etc.) to tint the image. If provided, an overlay will be applied.
  tint?: string;
};

export default function SideImage({
  src,
  alt = '',
  side = 'right',
  width = 220,
  height = 'auto',
  className = '',
  decorative = false,
  blend = 'multiply',
  tint,
}: Props) {
  const base = `fixed top-24 z-10 hidden lg:block ${className}`;
  const sideClass = side === 'left' ? 'left-6' : 'right-6';

  const blendClassMap: Record<string, string> = {
    normal: 'mix-blend-normal',
    multiply: 'mix-blend-multiply',
    screen: 'mix-blend-screen',
    overlay: 'mix-blend-overlay',
    darken: 'mix-blend-darken',
    lighten: 'mix-blend-lighten',
  };

  const blendClass = blendClassMap[blend] || '';

  return (
    <div className={`${base} ${sideClass}`} style={{ width }}>
      <div className="relative">
        <img
          src={src}
          alt={decorative ? '' : alt}
          aria-hidden={decorative}
          style={{ height }}
          className={`rounded-lg object-cover max-w-full ${blendClass}`}
        />

        {/* Tint overlay: absolute, pointer-events-none. Uses CSS mixBlendMode for colorizing. */}
        {tint && (
          <div
            aria-hidden
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{ background: tint, mixBlendMode: blend }}
          />
        )}
      </div>
    </div>
  );
}
