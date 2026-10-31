import { ARENA, PLATFORMS } from './config';
import { TAU, circle, roundRect, star, shadow, drawEyes } from './shapes';
import { clamp, rnd } from './helpers';
import { drawEnemy } from './drawEnemies';

/* ---------------- flags ---------------- */

function paintFlag(ctx, cx, cy, r, flag) {
  const d = r * 2;
  const left = cx - r;
  const top = cy - r;

  if (flag === 'hre') {
    ctx.fillStyle = '#f0c94a';
    ctx.fillRect(left, top, d, d);
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.06, r * 0.15, r * 0.3, 0, 0, TAU);
    ctx.fill();
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.12);
      ctx.quadraticCurveTo(cx + side * r * 0.5, cy - r * 0.4, cx + side * r * 0.6, cy + r * 0.12);
      ctx.quadraticCurveTo(cx + side * r * 0.3, cy + r * 0.04, cx, cy + r * 0.22);
      ctx.closePath();
      ctx.fill();
      circle(ctx, cx + side * r * 0.13, cy - r * 0.4, r * 0.1);
      ctx.fill();
    }
  } else if (flag === 'polandlithuania') {
    ctx.fillStyle = '#f7f3ea';
    ctx.fillRect(left, top, d, r);
    ctx.fillStyle = '#c8102e';
    ctx.fillRect(left, cy, d, r);
    ctx.fillStyle = '#c9a227';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.26, cy - r * 0.3);
    ctx.lineTo(cx - r * 0.26, cy - r * 0.52);
    ctx.lineTo(cx - r * 0.1, cy - r * 0.36);
    ctx.lineTo(cx, cy - r * 0.58);
    ctx.lineTo(cx + r * 0.1, cy - r * 0.36);
    ctx.lineTo(cx + r * 0.26, cy - r * 0.52);
    ctx.lineTo(cx + r * 0.26, cy - r * 0.3);
    ctx.closePath();
    ctx.fill();
  } else if (flag === 'jerusalem') {
    ctx.fillStyle = '#f6f1e3';
    ctx.fillRect(left, top, d, d);
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(cx - r * 0.1, cy - r * 0.55, r * 0.2, r * 1.1);
    ctx.fillRect(cx - r * 0.55, cy - r * 0.1, r * 1.1, r * 0.2);
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        ctx.fillRect(cx + sx * r * 0.4 - r * 0.04, cy + sy * r * 0.4 - r * 0.13, r * 0.08, r * 0.26);
        ctx.fillRect(cx + sx * r * 0.4 - r * 0.13, cy + sy * r * 0.4 - r * 0.04, r * 0.26, r * 0.08);
      }
    }
  } else if (flag === 'byzantium') {
    ctx.fillStyle = '#5b1f4a';
    ctx.fillRect(left, top, d, d);
    ctx.fillStyle = '#e8c25c';
    ctx.fillRect(cx - r * 0.1, cy - r * 0.55, r * 0.2, r * 1.1);
    ctx.fillRect(cx - r * 0.55, cy - r * 0.1, r * 1.1, r * 0.2);
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        circle(ctx, cx + sx * r * 0.45, cy + sy * r * 0.45, r * 0.09);
        ctx.fill();
      }
    }
  } else if (flag === 'rashidun') {
    // the black banner of Medina
    ctx.fillStyle = '#151515';
    ctx.fillRect(left, top, d, d);
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(left, top, d, Math.max(2, r * 0.1));
    ctx.fillRect(left, top + d - Math.max(2, r * 0.1), d, Math.max(2, r * 0.1));
    ctx.strokeStyle = '#f4ead2';
    ctx.lineWidth = Math.max(2, r * 0.07);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.44, cy + r * 0.14);
    ctx.quadraticCurveTo(cx - r * 0.08, cy - r * 0.36, cx + r * 0.18, cy + r * 0.02);
    ctx.quadraticCurveTo(cx + r * 0.38, cy + r * 0.26, cx + r * 0.46, cy - r * 0.18);
    ctx.stroke();
  } else if (flag === 'umayyad') {
    // the white banner of Damascus
    ctx.fillStyle = '#f7f2e4';
    ctx.fillRect(left, top, d, d);
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(left, cy + r * 0.52, d, r * 0.18);
    star(ctx, cx, cy - r * 0.06, r * 0.54, 8, 0.46);
    ctx.fill();
    ctx.fillStyle = '#f7f2e4';
    circle(ctx, cx, cy - r * 0.06, r * 0.21);
    ctx.fill();
  } else if (flag === 'abbasid') {
    // the black banner of Baghdad under a golden gate
    ctx.fillStyle = '#17161c';
    ctx.fillRect(left, top, d, d);
    ctx.fillStyle = '#c9a227';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.54, cy + r * 0.44);
    ctx.lineTo(cx - r * 0.54, cy - r * 0.08);
    ctx.quadraticCurveTo(cx, cy - r * 0.88, cx + r * 0.54, cy - r * 0.08);
    ctx.lineTo(cx + r * 0.54, cy + r * 0.44);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#17161c';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.27, cy + r * 0.44);
    ctx.lineTo(cx - r * 0.27, cy + r * 0.04);
    ctx.quadraticCurveTo(cx, cy - r * 0.46, cx + r * 0.27, cy + r * 0.04);
    ctx.lineTo(cx + r * 0.27, cy + r * 0.44);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c9a227';
    star(ctx, cx, cy + r * 0.08, r * 0.15, 5, 0.45);
    ctx.fill();
  } else if (flag === 'fatimid') {
    // the green of Cairo and a white crescent
    ctx.fillStyle = '#1f6b46';
    ctx.fillRect(left, top, d, d);
    ctx.fillStyle = 'rgba(255,255,255,0.13)';
    ctx.fillRect(left, top, d, r * 0.5);
    ctx.fillStyle = '#f7f2e4';
    circle(ctx, cx + r * 0.02, cy - r * 0.04, r * 0.44);
    ctx.fill();
    ctx.fillStyle = '#1f6b46';
    circle(ctx, cx + r * 0.26, cy - r * 0.16, r * 0.4);
    ctx.fill();
    ctx.fillStyle = '#f7f2e4';
    star(ctx, cx + r * 0.34, cy + r * 0.34, r * 0.17, 5, 0.45);
    ctx.fill();
  } else if (flag === 'ottoman') {
    // the red of the Porte, crescent and star
    ctx.fillStyle = '#a8291f';
    ctx.fillRect(left, top, d, d);
    ctx.fillStyle = '#f7f2e4';
    circle(ctx, cx - r * 0.08, cy, r * 0.44);
    ctx.fill();
    ctx.fillStyle = '#a8291f';
    circle(ctx, cx + r * 0.14, cy, r * 0.38);
    ctx.fill();
    ctx.fillStyle = '#f7f2e4';
    star(ctx, cx + r * 0.36, cy, r * 0.2, 5, 0.45);
    ctx.fill();
  } else if (flag === 'merchant') {
    ctx.fillStyle = '#e0c184';
    ctx.fillRect(left, top, d, d);
    ctx.fillStyle = '#8a6034';
    ctx.fillRect(left, cy - r * 0.08, d, r * 0.16);
    for (const side of [-1, 1]) {
      const x = cx + side * r * 0.42;
      for (const sy of [-1, 1]) {
        circle(ctx, x, cy + sy * r * 0.44, r * 0.11);
        ctx.fill();
      }
    }
  } else if (flag === 'alchemist') {
    ctx.fillStyle = '#8fd6b4';
    ctx.fillRect(left, top, d, d);
    ctx.fillStyle = '#3d6b56';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * (0.32 + i * 0.24), 0.4, 3.6);
      ctx.lineWidth = Math.max(2, r * 0.07);
      ctx.strokeStyle = '#3d6b56';
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = '#c9a86a';
    ctx.fillRect(left, top, d, d);
  }
}

export function drawCountryball(ctx, cx, cy, r, spec, opts = {}) {
  const { facing = 1, flash = 0, angry = false, glow = null } = opts;
  ctx.save();
  circle(ctx, cx, cy, r);
  ctx.clip();
  paintFlag(ctx, cx, cy, r, spec.flag);
  const sg = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  sg.addColorStop(0, 'rgba(255,255,255,0.16)');
  sg.addColorStop(0.55, 'rgba(0,0,0,0)');
  sg.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = sg;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(0.9, flash * 5)})`;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  ctx.restore();

  ctx.strokeStyle = 'rgba(18,10,6,0.55)';
  ctx.lineWidth = Math.max(2, r * 0.07);
  circle(ctx, cx, cy, r);
  ctx.stroke();
  drawEyes(ctx, cx, cy, r, facing, { angry, glow });
}

/* ---------------- background ---------------- */

function drawBackground(ctx, world, t) {
  const g = ctx.createLinearGradient(0, 0, 0, ARENA.h);
  g.addColorStop(0, world.sky[0]);
  g.addColorStop(0.62, world.sky[1]);
  g.addColorStop(1, world.sky[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, ARENA.w, ARENA.h);

  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = world.sun;
  circle(ctx, 1190, 232, 84);
  ctx.fill();
  ctx.globalAlpha = 0.15;
  circle(ctx, 1190, 232, 130);
  ctx.fill();
  ctx.restore();

  // far ridge
  ctx.fillStyle = world.far;
  ctx.beginPath();
  ctx.moveTo(0, 700);
  for (let x = 0; x <= ARENA.w; x += 160) {
    const drift = Math.sin(x / 260 + t * 0.03) * 12;
    ctx.quadraticCurveTo(x + 80, 540 + drift, x + 160, 700);
  }
  ctx.lineTo(ARENA.w, ARENA.h);
  ctx.lineTo(0, ARENA.h);
  ctx.closePath();
  ctx.fill();

  // citadel arches
  if (world.id === 'citadel') {
    ctx.fillStyle = 'rgba(10,8,18,0.55)';
    for (let i = 0; i < 5; i++) {
      const x = 130 + i * 330;
      const w = 150;
      const top = 470;
      ctx.beginPath();
      ctx.moveTo(x, 700);
      ctx.lineTo(x, top + 70);
      ctx.quadraticCurveTo(x + w / 2, top - 40, x + w, top + 70);
      ctx.lineTo(x + w, 700);
      ctx.closePath();
      ctx.fill();
    }
  }

  // nearer dunes
  ctx.fillStyle = world.mid;
  ctx.beginPath();
  ctx.moveTo(0, 760);
  for (let x = 0; x <= ARENA.w; x += 200) {
    const drift = Math.cos(x / 200 + t * 0.05) * 10;
    ctx.quadraticCurveTo(x + 100, 660 + drift, x + 200, 760);
  }
  ctx.lineTo(ARENA.w, ARENA.h);
  ctx.lineTo(0, ARENA.h);
  ctx.closePath();
  ctx.fill();
}

function drawArena(ctx, world) {
  const gy = ARENA.groundY;
  ctx.fillStyle = world.sand;
  ctx.fillRect(0, gy, ARENA.w, ARENA.h - gy);
  ctx.fillStyle = world.sandDark;
  ctx.fillRect(0, gy + 46, ARENA.w, ARENA.h - gy - 46);
  ctx.fillStyle = world.rock;
  ctx.fillRect(0, gy + 98, ARENA.w, ARENA.h - gy - 98);
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.fillRect(0, gy, ARENA.w, 4);

  // sand speckles
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  for (let i = 0; i < 60; i++) {
    const x = (i * 137) % ARENA.w;
    const y = gy + 10 + ((i * 53) % 34);
    ctx.fillRect(x, y, 3, 2);
  }

  for (const pl of PLATFORMS) {
    ctx.fillStyle = world.rock;
    roundRect(ctx, pl.x, pl.y, pl.w, pl.h + 8, 8);
    ctx.fill();
    ctx.fillStyle = world.platform;
    roundRect(ctx, pl.x, pl.y, pl.w, pl.h, 8);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    roundRect(ctx, pl.x + 6, pl.y + 3, pl.w - 12, 5, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.14)';
    for (let i = 0; i < Math.floor(pl.w / 60); i++) {
      circle(ctx, pl.x + 34 + i * 60, pl.y + 14, 2.5);
      ctx.fill();
    }
  }
}

/* ---------------- player ---------------- */

function drawPlayerWeapon(ctx, game, cx, cy, r, w) {
  const p = game.player;
  let ang = -0.55;
  if (p.spin > 0) ang = game.time * 16;
  else if (p.swing) ang = -1.25 + (p.swing.t / p.swing.dur) * 2.5;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(p.facing, 1);
  ctx.rotate(ang);

  if (w.kind === 'greatsword') {
    ctx.strokeStyle = '#e9dcc0';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.55, 0);
    ctx.lineTo(r * 1.95, 0);
    ctx.stroke();
    ctx.fillStyle = '#dfe6ee';
    ctx.beginPath();
    ctx.moveTo(r * 2.28, 0);
    ctx.lineTo(r * 1.92, -r * 0.16);
    ctx.lineTo(r * 1.92, r * 0.16);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(r * 0.42, -r * 0.26);
    ctx.lineTo(r * 0.42, r * 0.26);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.04, 0);
    ctx.lineTo(r * 0.44, 0);
    ctx.stroke();
  } else if (w.kind === 'lance') {
    ctx.strokeStyle = '#7a5530';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, r * 0.22);
    ctx.lineTo(r * 2.6, r * 0.08);
    ctx.stroke();
    ctx.fillStyle = '#eae3d0';
    ctx.beginPath();
    ctx.moveTo(r * 3.0, r * 0.05);
    ctx.lineTo(r * 2.5, -r * 0.1);
    ctx.lineTo(r * 2.5, r * 0.24);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c8102e';
    ctx.beginPath();
    ctx.moveTo(r * 2.15, r * 0.12);
    ctx.lineTo(r * 2.15, -r * 0.5);
    ctx.lineTo(r * 1.55, -r * 0.22);
    ctx.closePath();
    ctx.fill();
  } else if (w.kind === 'crossbow') {
    ctx.strokeStyle = '#7a5530';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.4, r * 0.1);
    ctx.lineTo(r * 1.85, r * 0.1);
    ctx.stroke();
    ctx.strokeStyle = '#5b4026';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(r * 1.45, -r * 0.5);
    ctx.quadraticCurveTo(r * 2.12, r * 0.1, r * 1.45, r * 0.7);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(245,235,210,0.9)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(r * 1.45, -r * 0.5);
    ctx.lineTo(r * 1.45, r * 0.7);
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#6b4a2a';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.1, r * 0.45);
    ctx.lineTo(r * 1.1, -r * 0.35);
    ctx.stroke();
    ctx.fillStyle = '#c9a227';
    circle(ctx, r * 1.22, -r * 0.44, r * 0.14);
    ctx.fill();
    const g = ctx.createRadialGradient(r * 1.6, -r * 0.72, 0, r * 1.6, -r * 0.72, r * 0.8);
    g.addColorStop(0, '#fff0c4');
    g.addColorStop(0.45, '#ff8a3c');
    g.addColorStop(1, 'rgba(255,110,40,0)');
    ctx.fillStyle = g;
    circle(ctx, r * 1.6, -r * 0.72, r * 0.8);
    ctx.fill();
  }
  ctx.restore();
}

function drawGuard(ctx, game) {
  const p = game.player;
  const spec = game.char.shield;
  const r = p.w / 2;
  const cx = p.x + r;
  const cy = p.y + r;
  const hot = p.blockFlash > 0;

  ctx.save();
  ctx.globalAlpha = hot ? 0.8 : 0.42;
  ctx.strokeStyle = spec.color;
  ctx.lineWidth = 5;
  if (spec.coverage === 'all') {
    circle(ctx, cx, cy, r + 13);
    ctx.stroke();
  } else {
    const a0 = p.facing > 0 ? -1.05 : Math.PI - 1.05;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 13, a0, a0 + 2.1);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(cx + p.facing * (r + 13), cy);
  ctx.scale(p.facing, 1);
  ctx.globalAlpha = hot ? 1 : 0.92;

  if (spec.kind === 'tower') {
    ctx.fillStyle = '#4a3418';
    roundRect(ctx, -9, -r * 1.15, 18, r * 2.3, 7);
    ctx.fill();
    ctx.fillStyle = '#c9a227';
    roundRect(ctx, -6.5, -r * 1.02, 13, r * 2.04, 5);
    ctx.fill();
    ctx.fillStyle = '#f0d79a';
    star(ctx, 0, 0, r * 0.3, 5, 0.45);
    ctx.fill();
  } else if (spec.kind === 'winged') {
    for (const side of [-1, 1]) {
      ctx.strokeStyle = '#dfe6ee';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, side * r * 0.2);
      ctx.quadraticCurveTo(-r * 0.7, side * r * 0.8, -r * 0.2, side * r * 1.15);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(159,224,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.5, r * 1.1, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#9fe0ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.5, r * 1.1, 0, 0, TAU);
    ctx.stroke();
  } else if (spec.kind === 'buckler') {
    ctx.fillStyle = '#6d4a24';
    circle(ctx, 0, 0, r * 0.62);
    ctx.fill();
    ctx.fillStyle = '#f6f1e3';
    circle(ctx, 0, 0, r * 0.5);
    ctx.fill();
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(-r * 0.06, -r * 0.42, r * 0.12, r * 0.84);
    ctx.fillRect(-r * 0.42, -r * 0.06, r * 0.84, r * 0.12);
  } else {
    const g = ctx.createRadialGradient(r * 0.1, 0, 2, r * 0.1, 0, r * 1.1);
    g.addColorStop(0, '#fff0c4');
    g.addColorStop(0.45, '#ff8a3c');
    g.addColorStop(1, 'rgba(255,110,40,0)');
    ctx.fillStyle = g;
    circle(ctx, r * 0.05, 0, r * 1.05);
    ctx.fill();
    ctx.strokeStyle = '#ffcf7a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.9, -1.2, 1.2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlayer(ctx, game) {
  const p = game.player;
  const c = game.char;
  const r = p.w / 2;
  const cx = p.x + r;
  const cy = p.y + r;

  if (p.invuln > 0 && Math.floor(game.time * 22) % 2 === 0 && p.hp > 0) return;

  shadow(ctx, cx, p.y + p.h, r);

  if (p.shield > 0) {
    ctx.save();
    ctx.globalAlpha = 0.4 + Math.sin(game.time * 10) * 0.1;
    ctx.fillStyle = 'rgba(140,210,255,0.18)';
    circle(ctx, cx, cy, r + 16);
    ctx.fill();
    ctx.strokeStyle = '#9fe0ff';
    ctx.lineWidth = 5;
    circle(ctx, cx, cy, r + 16);
    ctx.stroke();
    ctx.restore();
  }

  if (game.hasSk('aura')) drawAura(ctx, game);
  drawCountryball(ctx, cx, cy, r, { flag: c.flag }, { facing: p.facing, flash: p.flash });
  drawPlayerWeapon(ctx, game, cx, cy, r, c.weapon);
  if (p.blocking) drawGuard(ctx, game);

  if (p.spin > 0) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = '#ffe6b0';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    const a0 = game.time * 16;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, r + 26, a0 + i * 2.1, a0 + i * 2.1 + 1.05);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/* ---------------- boss ---------------- */

function drawBoss(ctx, b, time) {
  const r = b.w / 2;
  const cx = b.x + r;
  const cy = b.y + r;

  shadow(ctx, cx, ARENA.groundY, r * 1.05);

  ctx.save();
  ctx.globalAlpha = 0.22 + Math.sin(time * 4) * 0.07;
  ctx.fillStyle = b.aura;
  circle(ctx, cx, cy, r * 1.22);
  ctx.fill();
  ctx.restore();

  // the caliphate announces a higher phase with a ring of its own colour
  if (b.phase >= 2) {
    ctx.save();
    ctx.globalAlpha = (b.phase === 3 ? 0.55 : 0.34) + Math.sin(time * 7) * 0.1;
    ctx.strokeStyle = b.phase === 3 ? '#ff6a4c' : b.aura;
    ctx.lineWidth = 5;
    circle(ctx, cx, cy, r * 1.36);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  circle(ctx, cx, cy, r);
  ctx.clip();
  paintFlag(ctx, cx, cy, r, b.flag);
  const g = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  g.addColorStop(0, 'rgba(255,255,255,0.16)');
  g.addColorStop(0.58, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.34)');
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = b.aura;
  for (let i = 0; i < 6; i++) {
    circle(
      ctx,
      cx + Math.sin(i * 2.1 + time * 0.9) * r * 0.55,
      cy + Math.cos(i * 1.7 + time * 1.1) * r * 0.55,
      r * 0.085
    );
    ctx.fill();
  }
  ctx.restore();
  if (b.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(0.9, b.flash * 5)})`;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  ctx.restore();

  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 5;
  circle(ctx, cx, cy, r);
  ctx.stroke();

  if (b.kind === 'rashidun') {
    bossTurban(ctx, cx, cy, r, '#1a1a1a', '#c9a227');
    bossBeard(ctx, cx, cy, r, '#141414');
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(b.facing, 1);
    ctx.rotate(b.state === 'telegraph' ? -1.4 : -0.42);
    ctx.strokeStyle = '#e9dcc0';
    ctx.lineWidth = 13;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.6, 0);
    ctx.lineTo(r * 2.25, 0);
    ctx.stroke();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(r * 0.58, -r * 0.3);
    ctx.lineTo(r * 0.58, r * 0.3);
    ctx.stroke();
    ctx.restore();
  } else if (b.kind === 'umayyad') {
    bossTurban(ctx, cx, cy, r, '#f4efe2', '#c9a227');
    ctx.fillStyle = '#c9a227';
    star(ctx, cx, cy - r * 0.88, r * 0.13, 6, 0.5);
    ctx.fill();
    bossBeard(ctx, cx, cy, r, '#3a2a18');
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(b.facing, 1);
    ctx.rotate(b.state === 'telegraph' ? -0.24 : -0.62);
    ctx.strokeStyle = '#7a5530';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, 0);
    ctx.lineTo(r * 2.5, 0);
    ctx.stroke();
    ctx.fillStyle = '#eae3d0';
    ctx.beginPath();
    ctx.moveTo(r * 2.9, 0);
    ctx.lineTo(r * 2.42, -r * 0.16);
    ctx.lineTo(r * 2.42, r * 0.16);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else if (b.kind === 'abbasid') {
    bossTurban(ctx, cx, cy, r, '#16161c', '#c9a227');
    ctx.fillStyle = '#c9a227';
    circle(ctx, cx, cy - r * 0.92, r * 0.14);
    ctx.fill();
    ctx.fillStyle = '#16161c';
    circle(ctx, cx + r * 0.07, cy - r * 0.92, r * 0.12);
    ctx.fill();
    bossBeard(ctx, cx, cy, r, '#1d1d24');
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(b.facing, 1);
    ctx.rotate(b.state === 'telegraph' ? -0.95 : -0.32);
    ctx.strokeStyle = '#6b4a2a';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.3, r * 0.85);
    ctx.lineTo(r * 1.7, -r * 0.55);
    ctx.stroke();
    ctx.fillStyle = '#c9a227';
    star(ctx, r * 1.78, -r * 0.63, r * 0.3, 8, 0.44);
    ctx.fill();
    ctx.restore();
  } else if (b.kind === 'fatimid') {
    bossTurban(ctx, cx, cy, r, '#1f6b46', '#f7f2e4');
    bossBeard(ctx, cx, cy, r, '#12301f');
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(b.facing, 1);
    ctx.rotate(b.state === 'telegraph' ? -1.0 : -0.35);
    ctx.strokeStyle = '#4a3418';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.3, r * 0.9);
    ctx.lineTo(r * 1.6, -r * 0.5);
    ctx.stroke();
    ctx.fillStyle = '#1f6b46';
    roundRect(ctx, r * 1.02, -r * 0.86, r * 0.6, r * 0.78, 8);
    ctx.fill();
    const lg = ctx.createRadialGradient(r * 1.32, -r * 0.47, 1, r * 1.32, -r * 0.47, r * 0.46);
    lg.addColorStop(0, '#f7ffd8');
    lg.addColorStop(0.5, b.aura);
    lg.addColorStop(1, 'rgba(168,255,208,0)');
    ctx.fillStyle = lg;
    circle(ctx, r * 1.32, -r * 0.47, r * 0.46);
    ctx.fill();
    ctx.restore();
  } else {
    // ottoman: a fez above the wrap, and a heavy scimitar
    bossTurban(ctx, cx, cy, r, '#f4efe2', '#a8291f');
    ctx.fillStyle = '#a8291f';
    roundRect(ctx, cx - r * 0.36, cy - r * 1.26, r * 0.72, r * 0.46, 6);
    ctx.fill();
    ctx.fillStyle = '#f7f2e4';
    circle(ctx, cx, cy - r * 0.96, r * 0.12);
    ctx.fill();
    ctx.strokeStyle = '#141414';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.32, cy - r * 1.18);
    ctx.quadraticCurveTo(cx + r * 0.7, cy - r * 1.36, cx + r * 0.92, cy - r * 1.02);
    ctx.stroke();
    bossBeard(ctx, cx, cy, r, '#2a1a10');
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(b.facing, 1);
    ctx.rotate(b.state === 'telegraph' ? -1.5 : -0.5);
    ctx.strokeStyle = '#e9dcc0';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.7, 0);
    ctx.quadraticCurveTo(r * 1.7, -r * 0.85, r * 2.6, -r * 0.22);
    ctx.stroke();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(r * 0.62, -r * 0.32);
    ctx.lineTo(r * 0.62, r * 0.32);
    ctx.stroke();
    ctx.restore();
  }

  drawEyes(ctx, cx, cy - r * 0.06, r * 0.86, b.facing, { angry: true, glow: b.glow });

  if (b.state === 'telegraph') {
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = '#ff5a44';
    ctx.lineWidth = 5;
    circle(ctx, cx, cy, r + 14 + Math.sin(time * 18) * 4);
    ctx.stroke();
    ctx.fillStyle = '#ff5a44';
    ctx.font = '700 46px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', cx, cy - r - 20);
    ctx.restore();
  }

  drawBossSay(ctx, b);
}

/* ---------------- boss dress and speech ---------------- */

function bossTurban(ctx, cx, cy, r, wrap, band) {
  ctx.save();
  ctx.translate(cx, cy - r * 0.58);
  ctx.fillStyle = wrap;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.88, r * 0.5, 0, Math.PI, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, r * 0.04, r * 0.94, r * 0.3, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = band;
  roundRect(ctx, -r * 0.92, r * 0.06, r * 1.84, r * 0.16, 5);
  ctx.fill();
  ctx.restore();
}

function bossBeard(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.54, cy + r * 0.34);
  ctx.quadraticCurveTo(cx, cy + r * 1.02, cx + r * 0.54, cy + r * 0.34);
  ctx.quadraticCurveTo(cx, cy + r * 0.58, cx - r * 0.54, cy + r * 0.34);
  ctx.closePath();
  ctx.fill();
}

// what the caliphate says, wrapped in a bubble above its head
function drawBossSay(ctx, b) {
  const s = b.say;
  if (!s || s.t <= 0) return;
  const r = b.w / 2;
  const cx = b.x + r;
  const maxW = 620;
  ctx.font = '400 26px Georgia, serif';
  const rows = [];
  let row = '';
  for (const word of s.text.split(' ')) {
    const next = row ? `${row} ${word}` : word;
    if (ctx.measureText(next).width > maxW) {
      rows.push(row);
      row = word;
    } else {
      row = next;
    }
  }
  if (row) rows.push(row);

  const pad = 22;
  const lineH = 32;
  const boxW = Math.max(...rows.map((t) => ctx.measureText(t).width)) + pad * 2;
  const boxH = rows.length * lineH + pad * 1.5;
  const bx = clamp(cx - boxW / 2, 26, ARENA.w - boxW - 26);
  const by = Math.max(28, b.y - boxH - 38);

  ctx.save();
  ctx.globalAlpha = Math.min(1, s.t / 0.5);
  ctx.fillStyle = 'rgba(12,8,6,0.84)';
  roundRect(ctx, bx, by, boxW, boxH, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(201,162,39,0.65)';
  ctx.lineWidth = 2;
  roundRect(ctx, bx, by, boxW, boxH, 18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 14, by + boxH - 1);
  ctx.lineTo(cx + 14, by + boxH - 1);
  ctx.lineTo(cx, by + boxH + 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f8e7bd';
  ctx.textAlign = 'center';
  rows.forEach((t, i) => ctx.fillText(t, bx + boxW / 2, by + pad + 20 + i * lineH));
  ctx.restore();
}

/* ---------------- projectiles & particles ---------------- */

function drawProjectiles(ctx, list, time) {
  for (const pr of list) {
    const cx = pr.x + pr.w / 2;
    const cy = pr.y + pr.h / 2;

    if (pr.kind === 'arrow') {
      const ang = Math.atan2(pr.vy, pr.vx);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang);
      ctx.strokeStyle = pr.color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-pr.w * 0.9, 0);
      ctx.lineTo(pr.w * 0.25, 0);
      ctx.stroke();
      ctx.fillStyle = '#f6e6c0';
      ctx.beginPath();
      ctx.moveTo(pr.w * 0.8, 0);
      ctx.lineTo(pr.w * 0.1, -5);
      ctx.lineTo(pr.w * 0.1, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (pr.kind === 'javelin') {
      const ang = Math.atan2(pr.vy, pr.vx);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang);
      ctx.strokeStyle = '#8a5a2a';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-pr.w * 0.7, 0);
      ctx.lineTo(pr.w * 0.2, 0);
      ctx.stroke();
      ctx.fillStyle = '#dfe6ee';
      ctx.beginPath();
      ctx.moveTo(pr.w * 0.75, 0);
      ctx.lineTo(pr.w * 0.05, -6);
      ctx.lineTo(pr.w * 0.05, 6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,230,176,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-pr.w * 0.7, 0);
      ctx.lineTo(-pr.w * 1.05, 0);
      ctx.stroke();
      ctx.restore();
    } else if (pr.kind === 'shockwave') {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = pr.color;
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.arc(cx, ARENA.groundY, pr.w * 0.6, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 26;
      ctx.stroke();
      ctx.restore();
    } else if (pr.kind === 'line') {
      const g = ctx.createLinearGradient(0, pr.y, 0, pr.y + pr.h);
      g.addColorStop(0, 'rgba(255,240,196,0.96)');
      g.addColorStop(0.5, pr.color);
      g.addColorStop(1, 'rgba(255,120,40,0.3)');
      ctx.fillStyle = g;
      roundRect(ctx, pr.x, pr.y, pr.w, pr.h, pr.h / 2);
      ctx.fill();
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = '#fff0c4';
      roundRect(ctx, pr.x + 16, pr.y + pr.h * 0.3, pr.w - 32, pr.h * 0.26, pr.h * 0.13);
      ctx.fill();
      ctx.restore();
    } else {
      const rad = pr.w * 0.5 + Math.sin(time * 18 + pr.x * 0.05) * 2;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad * 2);
      g.addColorStop(0, '#fff3cf');
      g.addColorStop(0.4, pr.color);
      g.addColorStop(1, 'rgba(255,90,30,0)');
      ctx.fillStyle = g;
      circle(ctx, cx, cy, rad * 2);
      ctx.fill();
      ctx.fillStyle = '#fff0c4';
      circle(ctx, cx, cy, rad * 0.45);
      ctx.fill();
    }
  }
}

function drawParticles(ctx, list) {
  for (const pt of list) {
    ctx.globalAlpha = Math.max(0, Math.min(1, pt.life / pt.max));
    ctx.fillStyle = pt.color;
    circle(ctx, pt.x, pt.y, pt.size);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawBanner(ctx, banner) {
  const a = Math.min(1, banner.t / 0.45);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(10,6,4,0.55)';
  roundRect(ctx, ARENA.w / 2 - 340, 186, 680, 132, 22);
  ctx.fill();
  ctx.strokeStyle = 'rgba(201,162,39,0.5)';
  ctx.lineWidth = 2;
  roundRect(ctx, ARENA.w / 2 - 340, 186, 680, 132, 22);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe6b0';
  ctx.font = '600 52px Cinzel, Georgia, serif';
  ctx.fillText(banner.text, ARENA.w / 2, 256);
  ctx.fillStyle = 'rgba(255,230,176,0.78)';
  ctx.font = '400 24px Georgia, serif';
  ctx.fillText(banner.sub, ARENA.w / 2, 294);
  ctx.restore();
}

/* ---------------- blessings, companion and the boat ---------------- */

function drawAura(ctx, game) {
  const p = game.player;
  const r = p.w / 2;
  const cx = p.x + r;
  const cy = p.y + r;
  const a0 = game.time * 2.4;
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = '#e8c07a';
  ctx.lineWidth = 4;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(cx, cy, r + 30, a0 + i * 2.1, a0 + i * 2.1 + 0.95);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBolts(ctx, list) {
  for (const b of list) {
    const a = Math.max(0, Math.min(1, b.t / 0.26));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#fff6cf';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(b.x, -20);
    ctx.lineTo(b.x + 16, b.y * 0.34);
    ctx.lineTo(b.x - 14, b.y * 0.62);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.globalAlpha = a * 0.45;
    ctx.fillStyle = '#ffe6b0';
    circle(ctx, b.x, b.y, 12 + 30 * (1 - a));
    ctx.fill();
    ctx.restore();
  }
}

function drawBoat(ctx, game) {
  const b = game.boat;
  if (!b) return;
  const { x, y, w, h } = b;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, ARENA.groundY - 2, w * 0.52, 7, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#5b4026';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.52, y - 2);
  ctx.lineTo(x + w * 0.52, y - 68);
  ctx.stroke();
  ctx.fillStyle = 'rgba(246,241,227,0.85)';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.55, y - 64);
  ctx.quadraticCurveTo(x + w * 0.95, y - 40, x + w * 0.57, y - 12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#6b4a2a';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.quadraticCurveTo(x + w * 0.8, y + h, x + w * 0.5, y + h);
  ctx.quadraticCurveTo(x + w * 0.2, y + h, x, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8a6034';
  ctx.fillRect(x + 5, y - 4, w - 10, 6);
  ctx.restore();
}

function drawPickups(ctx, list, time) {
  for (const it of list) {
    const cx = it.x + it.w / 2;
    const cy = it.y + it.h / 2 + Math.sin(time * 4 + cx * 0.05) * 2;
    ctx.save();
    if (it.life < 3) ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(it.life * 6));
    ctx.fillStyle = '#c98a4a';
    roundRect(ctx, cx - 15, cy - 11, 30, 22, 8);
    ctx.fill();
    ctx.fillStyle = '#e8c07a';
    roundRect(ctx, cx - 11, cy - 9, 22, 10, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(90,58,26,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 9, cy + 2);
    ctx.lineTo(cx + 9, cy + 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawAlly(ctx, game) {
  const a = game.ally;
  if (!a) return;
  const r = a.w / 2;
  const cx = a.x + r;
  const cy = a.y + r;
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#7ddca0';
  circle(ctx, cx, cy, r + 9);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#7ddca0';
  circle(ctx, cx, cy, r);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  circle(ctx, cx - r * 0.28, cy - r * 0.34, r * 0.3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(18,10,6,0.5)';
  ctx.lineWidth = 2.5;
  circle(ctx, cx, cy, r);
  ctx.stroke();
  drawEyes(ctx, cx, cy, r * 0.84, a.facing, {});
  ctx.strokeStyle = '#ffe6b0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, cy - r - 8, r * 0.5, r * 0.15, 0, 0, TAU);
  ctx.stroke();
}

/* ---------------- camp: Ahmed, the Alchemist and buried caches ---------------- */

function drawCamp(ctx, game) {
  const npc = game.campNpc;
  const chest = game.treasure;
  const target = npc || chest;
  if (!target) return;

  const cx = target.x + target.w / 2;
  const bob = Math.sin(target.bob * 2.2) * 4;

  if (npc) {
    const r = npc.w / 2;
    const cy = npc.y + r + bob;
    shadow(ctx, cx, npc.y + npc.h, r);
    drawCountryball(ctx, cx, cy, r, { flag: npc.kind === 'merchant' ? 'merchant' : 'alchemist' }, { facing: -1 });

    if (npc.kind === 'merchant') {
      ctx.fillStyle = '#f6f1e3';
      ctx.beginPath();
      ctx.ellipse(cx, cy - r * 0.72, r * 0.82, r * 0.44, 0, Math.PI, TAU);
      ctx.fill();
      ctx.fillStyle = '#c9a227';
      circle(ctx, cx, cy - r * 0.8, r * 0.15);
      ctx.fill();
      ctx.fillStyle = '#8a6034';
      roundRect(ctx, cx + r * 0.72, cy + r * 0.06, r * 0.72, r * 0.66, 9);
      ctx.fill();
      ctx.fillStyle = '#f0c94a';
      circle(ctx, cx + r * 0.9, cy + r * 0.18, r * 0.15);
      ctx.fill();
      circle(ctx, cx + r * 1.24, cy + r * 0.26, r * 0.13);
      ctx.fill();
    } else {
      ctx.fillStyle = '#3d2a55';
      ctx.beginPath();
      ctx.moveTo(cx - r * 1.0, cy + r * 0.16);
      ctx.quadraticCurveTo(cx, cy - r * 1.85, cx + r * 1.0, cy + r * 0.16);
      ctx.quadraticCurveTo(cx, cy - r * 0.42, cx - r * 1.0, cy + r * 0.16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#7ddca0';
      roundRect(ctx, cx + r * 0.72, cy - r * 0.12, r * 0.36, r * 0.64, 7);
      ctx.fill();
      ctx.fillStyle = '#e8c07a';
      ctx.fillRect(cx + r * 0.76, cy - r * 0.36, r * 0.28, r * 0.18);
    }
  } else {
    const r = chest.w / 2;
    shadow(ctx, cx, ARENA.groundY, r * 0.9);
    ctx.save();
    if (chest.opened) {
      ctx.fillStyle = '#5b4026';
      roundRect(ctx, chest.x + 6, chest.y + chest.h * 0.62 + bob, chest.w - 12, chest.h * 0.44, 6);
      ctx.fill();
      ctx.fillStyle = '#2f2113';
      roundRect(ctx, chest.x + 11, chest.y + chest.h * 0.68 + bob, chest.w - 22, chest.h * 0.34, 4);
      ctx.fill();
      ctx.fillStyle = '#7a5530';
      roundRect(ctx, chest.x, chest.y + chest.h * 0.02 + bob, chest.w, chest.h * 0.28, 6);
      ctx.fill();
    } else {
      ctx.fillStyle = '#6b4a2a';
      roundRect(ctx, chest.x, chest.y + chest.h * 0.34 + bob, chest.w, chest.h * 0.66, 8);
      ctx.fill();
      ctx.fillStyle = '#7a5530';
      ctx.beginPath();
      ctx.ellipse(cx, chest.y + chest.h * 0.36 + bob, chest.w / 2, chest.h * 0.3, 0, Math.PI, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      roundRect(ctx, chest.x + 8, chest.y + chest.h * 0.42 + bob, chest.w - 16, 6, 3);
      ctx.fill();
      ctx.fillStyle = '#c9a227';
      ctx.fillRect(cx - chest.w * 0.05, chest.y + chest.h * 0.3 + bob, chest.w * 0.1, chest.h * 0.5);
    }
    ctx.restore();
  }

  const near = game.nearCamp;
  const label = npc
    ? near
      ? npc.kind === 'merchant'
        ? 'E · Talk to Ahmed'
        : 'E · Talk to the Alchemist'
      : npc.name
    : near
      ? 'E · Open the cache'
      : 'a buried cache';

  ctx.save();
  ctx.globalAlpha = near ? 1 : 0.8;
  ctx.fillStyle = 'rgba(10,6,4,0.62)';
  roundRect(ctx, cx - 150, target.y - 70 + bob, 300, 46, 14);
  ctx.fill();
  ctx.strokeStyle = near ? 'rgba(201,162,39,0.9)' : 'rgba(201,162,39,0.35)';
  ctx.lineWidth = 2;
  roundRect(ctx, cx - 150, target.y - 70 + bob, 300, 46, 14);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = near ? '#f8e7bd' : '#a4917a';
  ctx.font = '600 23px Inter, system-ui, sans-serif';
  ctx.fillText(label, cx, target.y - 38 + bob);
  ctx.restore();
}

/* ---------------- main render ---------------- */

export function render(ctx, game) {
  ctx.clearRect(0, 0, ARENA.w, ARENA.h);
  ctx.save();
  if (game.shake > 0) {
    const s = game.shake * 12;
    ctx.translate(rnd(-s, s), rnd(-s, s));
  }

  drawBackground(ctx, game.world, game.time);
  drawArena(ctx, game.world);

  drawBoat(ctx, game);
  drawCamp(ctx, game);
  for (const e of game.enemies) drawEnemy(ctx, e);
  if (game.boss) drawBoss(ctx, game.boss, game.time);
  drawPickups(ctx, game.pickups, game.time);
  if (game.status !== 'dead') drawPlayer(ctx, game);
  drawAlly(ctx, game);
  drawProjectiles(ctx, game.projectiles, game.time);
  drawBolts(ctx, game.bolts);
  drawParticles(ctx, game.particles);

  ctx.restore();

  // vignette
  const vg = ctx.createRadialGradient(ARENA.w / 2, ARENA.h / 2, ARENA.h * 0.35, ARENA.w / 2, ARENA.h / 2, ARENA.w * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, ARENA.w, ARENA.h);

  if (game.banner) drawBanner(ctx, game.banner);
}
