import { ARENA } from './config';

/* The Faithful Companion: a friendly ball that hovers beside you, pelts enemies
   with stones and every few seconds tosses you a loaf of bread.
   The Boat: it floats. It does nothing. */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function spawnCompanion(game) {
  const p = game.player;
  game.ally = {
    x: clamp(p.x - 76, 24, ARENA.w - 68),
    y: p.y - 34,
    w: 44,
    h: 44,
    facing: 1,
    atkCd: 1.5,
    tossCd: 9,
    bob: 0,
  };
}

export function spawnBoat(game) {
  const base = ARENA.w * 0.17;
  game.boat = { base, x: base, y: ARENA.groundY - 34, w: 150, h: 34, bob: 0 };
}

export function updateBoat(game, dt) {
  const b = game.boat;
  if (!b) return;
  b.bob += dt;
  b.x = b.base + Math.sin(b.bob * 0.25) * 34;
  b.y = ARENA.groundY - 34 + Math.sin(b.bob * 1.7) * 2;
}

export function updateCompanion(game, dt) {
  const a = game.ally;
  if (!a) return;
  const p = game.player;
  a.bob += dt;
  a.atkCd -= dt;
  a.tossCd -= dt;

  // hover at the fighter's shoulder
  const anchorX = p.x + (p.facing >= 0 ? -72 : 72);
  const anchorY = p.y - 34;
  const dx = anchorX - a.x;
  const dy = anchorY - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  if (dist > 8) {
    const spd = Math.min(360, dist * 4.2);
    a.x += (dx / dist) * spd * dt;
    a.y += (dy / dist) * spd * dt;
  }
  a.x = clamp(a.x, 20, ARENA.w - 20 - a.w);
  a.y = clamp(a.y, 40, ARENA.groundY - a.h - 4);
  a.y += Math.sin(a.bob * 3) * 12 * dt;

  let target = null;
  let best = 1e9;
  for (const e of game.enemies) {
    if (e.dead || e.spawnT > 0) continue;
    const d = Math.hypot(e.x + e.w / 2 - (a.x + a.w / 2), e.y + e.h / 2 - (a.y + a.h / 2));
    if (d < best && d < 520) {
      best = d;
      target = e;
    }
  }
  if (target) a.facing = target.x + target.w / 2 >= a.x + a.w / 2 ? 1 : -1;

  if (target && a.atkCd <= 0) {
    a.atkCd = 1.6;
    game.projectiles.push({
      x: a.x + a.w / 2 - 8,
      y: a.y + a.h / 2 - 8,
      w: 16,
      h: 16,
      vx: a.facing * 520,
      vy: 0,
      dmg: 7,
      owner: 'ally',
      kind: 'stone',
      life: 1.7,
      homing: 1,
      color: '#ffe6b0',
      hitIds: new Set(),
    });
  }

  if (a.tossCd <= 0) {
    a.tossCd = 10;
    game.dropBread(a.x + a.w / 2, a.y + a.h / 2, (p.x - a.x) * 1.05, -300);
    game.burst(a.x + a.w / 2, a.y + a.h / 2, '#ffd9a2', 6, 150);
  }
}
