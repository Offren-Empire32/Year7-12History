// small canvas primitives shared by the arena, the troops and the bosses
export const TAU = Math.PI * 2;

export function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
}

export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

export function star(ctx, cx, cy, r, points = 5, inner = 0.45) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * inner;
    const a = (i / (points * 2)) * TAU - Math.PI / 2;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function shadow(ctx, cx, baseY, r) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(cx, baseY - 3, r * 0.85, r * 0.2, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawEyes(ctx, cx, cy, r, facing, opts = {}) {
  const ex = r * 0.29;
  const ey = cy - r * 0.06;
  const look = facing * r * 0.06;
  for (const side of [-1, 1]) {
    const x = cx + side * ex;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x, ey, r * 0.19, r * 0.23, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = opts.glow || '#16202a';
    circle(ctx, x + look, ey + r * 0.02, r * 0.1);
    ctx.fill();
    if (opts.angry) {
      ctx.strokeStyle = 'rgba(18,10,6,0.75)';
      ctx.lineWidth = Math.max(2, r * 0.075);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x + side * r * 0.19, ey - r * 0.42);
      ctx.lineTo(x - side * r * 0.19, ey - r * 0.2);
      ctx.stroke();
    }
  }
}
