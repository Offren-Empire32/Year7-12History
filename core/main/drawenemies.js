import { TAU, circle, roundRect, shadow, drawEyes } from './shapes';

/* ---------------- weapons ---------------- */

function drawEnemyWeapon(ctx, e, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(e.facing, 1);

  if (e.kind === 'archer') {
    ctx.strokeStyle = '#8a5a32';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(r * 0.7, 0, r * 0.7, -1.1, 1.1);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(240,225,190,0.8)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(r * 0.7 + Math.cos(-1.1) * r * 0.7, Math.sin(-1.1) * r * 0.7);
    ctx.lineTo(r * 0.7 + Math.cos(1.1) * r * 0.7, Math.sin(1.1) * r * 0.7);
    ctx.stroke();
  } else if (e.kind === 'spearman') {
    ctx.strokeStyle = '#6b4a2a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(r * 0.5, r * 0.2);
    ctx.lineTo(r * 1.9, -r * 0.6);
    ctx.stroke();
    ctx.fillStyle = '#e8e2cf';
    ctx.beginPath();
    ctx.moveTo(r * 2.05, -r * 0.7);
    ctx.lineTo(r * 1.6, -r * 0.8);
    ctx.lineTo(r * 1.66, -r * 0.36);
    ctx.closePath();
    ctx.fill();
  } else if (e.kind === 'raider') {
    ctx.strokeStyle = '#cfd6dd';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.7, r * 0.1);
    ctx.quadraticCurveTo(r * 1.5, -r * 0.4, r * 1.4, -r * 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, r * 0.1);
    ctx.quadraticCurveTo(-r * 1.4, -r * 0.6, -r * 1.1, -r * 1.0);
    ctx.stroke();
  } else if (e.kind === 'brute') {
    ctx.strokeStyle = '#4a331f';
    ctx.lineWidth = r * 0.32;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.6, r * 0.1);
    ctx.lineTo(r * 1.6, -r * 0.6);
    ctx.stroke();
    ctx.fillStyle = '#5b4026';
    circle(ctx, r * 1.75, -r * 0.75, r * 0.36);
    ctx.fill();
  } else if (e.kind === 'shieldman') {
    // short spear, thrust over the shield rim
    ctx.strokeStyle = '#6b4a2a';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, r * 0.5);
    ctx.lineTo(r * 1.5, -r * 0.45);
    ctx.stroke();
    ctx.fillStyle = '#e8e2cf';
    ctx.beginPath();
    ctx.moveTo(r * 1.66, -r * 0.56);
    ctx.lineTo(r * 1.18, -r * 0.6);
    ctx.lineTo(r * 1.3, -r * 0.2);
    ctx.closePath();
    ctx.fill();
  } else if (e.kind === 'skirmisher') {
    // javelin couched low, plus a quiver on the hip
    ctx.fillStyle = '#7a4a2a';
    roundRect(ctx, -r * 0.92, -r * 0.5, r * 0.4, r * 1.0, 4);
    ctx.fill();
    ctx.strokeStyle = '#8a5a2a';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, r * 0.9);
    ctx.lineTo(r * 1.85, -r * 0.4);
    ctx.stroke();
    ctx.fillStyle = '#dfe6ee';
    ctx.beginPath();
    ctx.moveTo(r * 2.0, -r * 0.5);
    ctx.lineTo(r * 1.46, -r * 0.55);
    ctx.lineTo(r * 1.58, -r * 0.12);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.strokeStyle = '#6b3f7a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(r * 0.5, r * 0.4);
    ctx.lineTo(r * 1.2, -r * 1.1);
    ctx.stroke();
    const g = ctx.createRadialGradient(r * 1.25, -r * 1.25, 0, r * 1.25, -r * 1.25, r * 0.7);
    g.addColorStop(0, '#ffe6b0');
    g.addColorStop(1, 'rgba(255,140,60,0)');
    ctx.fillStyle = g;
    circle(ctx, r * 1.25, -r * 1.25, r * 0.7);
    ctx.fill();
  }
  ctx.restore();
}

/* ---------------- bodies ---------------- */

function drawBall(ctx, e, cx, cy, rr) {
  ctx.save();
  circle(ctx, cx, cy, rr);
  ctx.clip();
  ctx.fillStyle = e.color;
  ctx.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(cx - rr, cy + rr * 0.42, rr * 2, rr);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(cx - rr, cy - rr * 0.95, rr * 2, rr * 0.55);
  if (e.poison > 0) {
    ctx.fillStyle = 'rgba(110,220,120,0.3)';
    ctx.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
  }
  if (e.burn > 0) {
    ctx.fillStyle = 'rgba(255,120,50,0.32)';
    ctx.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
  }
  if (e.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(0.9, e.flash * 5)})`;
    ctx.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
  }
  ctx.restore();

  ctx.strokeStyle = 'rgba(18,10,6,0.5)';
  ctx.lineWidth = Math.max(2, rr * 0.07);
  circle(ctx, cx, cy, rr);
  ctx.stroke();
}

function drawHelmet(ctx, e, cx, cy, rr) {
  ctx.fillStyle = e.helmet;
  ctx.beginPath();
  ctx.arc(cx, cy - rr * 0.12, rr * 0.93, Math.PI * 1.03, Math.PI * 1.97);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(cx - rr * 0.93, cy - rr * 0.16, rr * 1.86, rr * 0.1);
  ctx.fillStyle = e.helmet;
  ctx.fillRect(cx - rr * 0.06, cy - rr * 0.16, rr * 0.12, rr * 0.3);
}

// the shield is only raised while the bearer advances, so it reads as a tell
function drawEnemyShield(ctx, e, cx, cy, rr) {
  const up = e.guarding;
  ctx.save();
  ctx.translate(cx + e.facing * rr * 0.8, cy + rr * 0.05);
  ctx.scale(e.facing, 1);
  ctx.globalAlpha = up ? 1 : 0.72;
  ctx.fillStyle = '#5b4630';
  circle(ctx, 0, 0, rr * (up ? 0.86 : 0.72));
  ctx.fill();
  ctx.fillStyle = up ? '#d8c69a' : '#b7a581';
  circle(ctx, 0, 0, rr * (up ? 0.72 : 0.58));
  ctx.fill();
  ctx.strokeStyle = '#8a6a3a';
  ctx.lineWidth = 3;
  circle(ctx, 0, 0, rr * (up ? 0.72 : 0.58));
  ctx.stroke();
  ctx.fillStyle = '#8a6a3a';
  ctx.fillRect(-rr * 0.07, -rr * 0.6, rr * 0.14, rr * 1.2);
  ctx.fillRect(-rr * 0.6, -rr * 0.07, rr * 1.2, rr * 0.14);
  if (e.blockFlash > 0) {
    ctx.globalAlpha = Math.min(0.9, e.blockFlash * 4);
    ctx.fillStyle = '#ffffff';
    circle(ctx, 0, 0, rr * 0.86);
    ctx.fill();
  }
  ctx.restore();
}

function drawFootEnemy(ctx, e) {
  const r = e.w / 2;
  const cx = e.x + r;
  const cy = e.y + r;
  shadow(ctx, cx, e.y + e.h, r * 0.9);

  const scale = e.spawnT > 0 ? 0.72 + 0.28 * (1 - e.spawnT / 0.35) : 1;
  const rr = r * scale;

  drawBall(ctx, e, cx, cy, rr);
  drawHelmet(ctx, e, cx, cy, rr);
  drawEyes(ctx, cx, cy + rr * 0.14, rr * 0.92, e.facing, { angry: true });
  drawEnemyWeapon(ctx, e, cx, cy, rr);
  if (e.blockMul) drawEnemyShield(ctx, e, cx, cy, rr);
}

function drawCavalry(ctx, e) {
  const { w, h } = e;
  const cx = e.x + w / 2;
  const baseY = e.y + h;
  const dir = e.facing;
  const riderR = h * 0.3;
  const riderCy = e.y + h * 0.34;
  const belly = e.y + h * 0.62;

  shadow(ctx, cx, baseY, w * 0.44);

  // legs, galloping while it rides someone down
  const gallop = e.state === 'charge' ? Math.sin(e.x * 0.4) * 10 : 0;
  ctx.strokeStyle = '#33241a';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  for (const off of [-0.22, 0.24]) {
    ctx.beginPath();
    ctx.moveTo(cx + w * off, belly + 2);
    ctx.lineTo(cx + w * off + gallop * (off < 0 ? -1 : 1), baseY);
    ctx.stroke();
  }

  // tail
  ctx.strokeStyle = '#3d2a18';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(cx - dir * w * 0.34, belly - 6);
  ctx.quadraticCurveTo(cx - dir * w * 0.5, belly - 18, cx - dir * w * 0.42, baseY - 8);
  ctx.stroke();

  // barrel, neck and head
  const barrel = () => roundRect(ctx, cx - w * 0.38, belly - 20, w * 0.76, 26, 12);
  ctx.fillStyle = '#8a6234';
  barrel();
  ctx.fill();
  ctx.fillStyle = '#9c7140';
  ctx.beginPath();
  ctx.moveTo(cx + dir * w * 0.26, belly - 18);
  ctx.quadraticCurveTo(cx + dir * w * 0.42, belly - 30, cx + dir * w * 0.44, belly - 42);
  ctx.lineTo(cx + dir * w * 0.24, belly - 44);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + dir * w * 0.5, belly - 46, 13, 8, dir * 0.45, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#5b4026';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx + dir * w * 0.24, belly - 40);
  ctx.quadraticCurveTo(cx + dir * w * 0.32, belly - 24, cx + dir * w * 0.26, belly - 12);
  ctx.stroke();

  // the horse burns, sickens and flashes along with its rider
  const tint =
    e.flash > 0
      ? `rgba(255,255,255,${Math.min(0.9, e.flash * 5)})`
      : e.burn > 0
        ? 'rgba(255,120,50,0.32)'
        : e.poison > 0
          ? 'rgba(110,220,120,0.3)'
          : null;
  if (tint) {
    ctx.fillStyle = tint;
    barrel();
    ctx.fill();
  }

  // rider
  const rx = cx - dir * w * 0.02;
  drawBall(ctx, e, rx, riderCy, riderR);
  drawHelmet(ctx, e, rx, riderCy, riderR);
  drawEyes(ctx, rx, riderCy + riderR * 0.14, riderR * 0.92, dir, { angry: true });

  // lance, couched for the charge
  ctx.save();
  ctx.translate(cx, riderCy);
  ctx.scale(dir, 1);
  const low = e.state === 'charge';
  ctx.strokeStyle = '#7a5530';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-riderR * 0.6, riderR * 0.55);
  ctx.lineTo(w * 0.62, riderR * (low ? -0.1 : -0.4));
  ctx.stroke();
  ctx.fillStyle = '#dfe6ee';
  ctx.beginPath();
  ctx.moveTo(w * 0.74, riderR * (low ? -0.02 : -0.32));
  ctx.lineTo(w * 0.5, riderR * (low ? -0.26 : -0.54));
  ctx.lineTo(w * 0.5, riderR * (low ? 0.22 : -0.14));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#b8352a';
  ctx.beginPath();
  ctx.moveTo(w * 0.34, riderR * 0.02);
  ctx.lineTo(w * 0.34, riderR * -0.78);
  ctx.lineTo(w * 0.54, riderR * -0.32);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* ---------------- dispatch ---------------- */

export function drawEnemy(ctx, e) {
  if (e.mount) drawCavalry(ctx, e);
  else drawFootEnemy(ctx, e);

  const r = e.w / 2;
  const cx = e.x + r;
  const cy = e.y + r;

  if (e.state === 'windup') {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = '#ff6b5a';
    ctx.lineWidth = 4;
    circle(ctx, cx, cy, r + 10);
    ctx.stroke();
    ctx.restore();
  }

  if (e.hp < e.maxHp) {
    const bw = e.w * 0.9;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    roundRect(ctx, cx - bw / 2, e.y - 16, bw, 6, 3);
    ctx.fill();
    ctx.fillStyle = '#ffb27a';
    roundRect(ctx, cx - bw / 2, e.y - 16, Math.max(2, bw * (e.hp / e.maxHp)), 6, 3);
    ctx.fill();
  }
}
