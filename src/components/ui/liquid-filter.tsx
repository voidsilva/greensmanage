'use client';

import { useEffect, useRef } from 'react';

/**
 * SVG displacement filter used by the `lens` utility. The displacement map is
 * generated once on a canvas: flat in the middle, bending hard at the edges,
 * like the rim of a glass lens.
 */
export function LiquidFilter() {
  const map = useRef<SVGFEImageElement>(null);
  useEffect(() => {
    const S = 128;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d');
    if (!g || !map.current) return;
    const im = g.createImageData(S, S);
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const nx = ((x + 0.5) / S) * 2 - 1;
        const ny = ((y + 0.5) / S) * 2 - 1;
        const e = Math.pow(Math.max(Math.abs(nx), Math.abs(ny)), 5);
        const i = (y * S + x) * 4;
        im.data[i] = 128 - nx * e * 127;
        im.data[i + 1] = 128 - ny * e * 127;
        im.data[i + 2] = 128;
        im.data[i + 3] = 255;
      }
    g.putImageData(im, 0, 0);
    map.current.setAttribute('href', c.toDataURL());
  }, []);
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <filter
        id="liquid"
        x="0"
        y="0"
        width="1"
        height="1"
        primitiveUnits="objectBoundingBox"
        colorInterpolationFilters="sRGB"
      >
        <feImage
          ref={map}
          x="0"
          y="0"
          width="1"
          height="1"
          preserveAspectRatio="none"
          result="map"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          scale="0.09"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
