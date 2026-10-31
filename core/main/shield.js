import { ARENA } from './config';

/* Guard / shield mechanic.
   Every fighter can raise a shield: while the guard meter holds, incoming blows
   are eaten completely. The guard drains while raised and every blocked blow
   spends more of it, so a shattering guard leaves the fighter staggered open. */

export const GUARD = {
  max: 100,
  regen: 26,
  regenDelay: 0.45,
  hitCost: 0.85,
  breakLock: 1.5,
  breakMitigate: 0.55,
  breakSlow: 0.55,
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// A shield covers the side it is turned to — unless it wraps all the way round.
function covers(spec, player, dirX) {
  if (spec.coverage === 'all' || !dirX) return true;
  return Math.sign(dirX) === -player.facing;
}

// { blocked, damage }: a raised shield negates the blow entirely, while a blow
// that shatters the guard still lands for part of its damage.
export function resolveGuardHit(game, amount, dirX, source) {
  const p = game.player;
  const spec = game.char.shield;
  if (!p.blocking || p.guard <= 0 || p.guardBroken > 0) return { blocked: false, damage: amount };
  if (!covers(spec, p, dirX)) return { blocked: false, damage: amount };

  p.guard = Math.max(0, p.guard - amount * GUARD.hitCost);
  p.guardHold = 0;
  p.blockFlash = 0.2;
  game.burst(p.x + p.w / 2 + p.facing * 26, p.y + p.h / 2, spec.color, 12, 210);

  // the shield's own answer to whoever struck it
  if (source && !source.dead) {
    if (spec.shove && source.id) {
      source.x = clamp(source.x - Math.sign(dirX) * spec.shove, 16, ARENA.w - 16 - source.w);
    }
    if (spec.burn) {
      if (source.id) game.hurtEnemy(source, spec.burn, -Math.sign(dirX) || 1);
      else if (source.maxHp) game.hurtBoss(spec.burn);
    }
  }

  if (p.guard <= 0) {
    game.breakGuard(dirX);
    return { blocked: false, damage: amount * GUARD.breakMitigate };
  }
  return { blocked: true, damage: 0 };
}
