import React, { useEffect, useRef } from 'react';
import { drawCountryball } from '@/game/draw';

export default function CountryballIcon({ flag, size = 96, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    drawCountryball(ctx, size / 2, size / 2, size * 0.4, { flag });
  }, [flag, size]);

  return <canvas ref={ref} style={{ width: size, height: size }} className={className} aria-hidden="true" />;
}
