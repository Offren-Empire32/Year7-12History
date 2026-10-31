import { ARENA, PLATFORMS, ENEMY_TYPES, GRAVITY, LEAP } from './config';
import { clamp, overlap, rnd } from './helpers';

// Troops spawn at either edge of the arena and scale with wave and world.
export function spawnEnemy(game, key, side) {
  const def = ENEMY_TYPES[key];
  const hpScale = (1 + (game.wave - 1) * 0.06) * (1 + game.worldIndex * 0.18);
  const dmgScale = (1 + (game.wave - 1) * 0.035) * (1 + game.worldIndex * 0.15);
  const { w, h } = def;
  const x = side === 'left' ? 30 : ARENA.w - 30 - w;
  game.enemies.push({
    id: ++game._eid,
    kind: key,
    x,
    y: ARENA.groundY - h,
    w,
    h,
    hp: def.hp * hpScale,
    maxHp: def.hp * hpScale,
    speed: def.speed,
    dmg: def.dmg * dmgScale,
    range: def.range,
    cd: rnd(0.6, 1.5),
    cdBase: def.cd,
    windup: def.windup,
    facing: side === 'left' ? 1 : -1,
    state: 'idle',
    timer: 0,
    flash: 0,
    color: def.color,
    helmet: def.helmet,
    mount: !!def.mount,
    poison: 0,
    burn: 0,
    poisonDps: 0,
    burnDps: 0,
    dead: false,
    spawnT: 0.35,
    vy: 0,
    onGround: true,
    jumpCd: rnd(0.25, 0.8),
    blockMul: def.block || 0,
    guarding: false,
    open: 0,
    blockFlash: 0,
    rangedShot: false,
    charging: false,
    hitCharge: false,
  });
  game.burst(x + w / 2, ARENA.groundY - h / 2, '#f2d9a8', 10, 150);
}

export function updateEnemies(game, dt) {
  const p = game.player;
  const px = p.x + p.w / 2;

  for (const e of [...game.enemies]) {
    if (e.dead) continue;
    e.flash = Math.max(0, e.flash - dt);
    if (e.spawnT > 0) {
      e.spawnT -= dt;
      continue;
    }
    e.cd = Math.max(0, e.cd - dt);
    e.blockFlash = Math.max(0, e.blockFlash - dt);
    if (e.poison > 0) {
      e.poison -= dt;
      game.hurtEnemy(e, e.poisonDps * dt, 0, { soft: true });
    }
    if (e.burn > 0) {
      e.burn -= dt;
      game.hurtEnemy(e, e.burnDps * dt, 0, { soft: true });
    }
    if (e.dead) continue;

    // a shield bearer only keeps its guard up while it is advancing
    if (e.blockMul) {
      e.open = Math.max(0, e.open - dt);
      e.guarding = e.state === 'idle' && e.open <= 0;
    }

    const ex = e.x + e.w / 2;
    const dx = px - ex;
    const dist = Math.abs(dx);
    e.facing = dx >= 0 ? 1 : -1;

    if (e.state === 'charge') {
      cavalryCharge(game, e, dt);
      holdFormation(game, e, dt);
      continue;
    }

    if (e.state === 'windup') {
      e.timer -= dt;
      if (e.timer <= 0) {
        if (e.charging) {
          e.charging = false;
          startCharge(game, e);
        } else {
          enemyStrike(game, e);
          e.state = 'idle';
          e.cd = e.cdBase;
        }
      }
      continue;
    }

    enemyFooting(game, e, dt);
    const ranged = e.kind === 'archer' || e.kind === 'caster' || e.kind === 'skirmisher';
    const leaping = enemyLeap(game, e, dt);

    if (!leaping && e.kind === 'cavalry') {
      cavalryPace(game, e, dist, dt);
    } else if (!leaping && ranged) {
      const ideal = e.kind === 'archer' ? 380 : e.kind === 'skirmisher' ? 430 : 300;
      if (dist > ideal + 50) e.x += e.facing * e.speed * dt;
      else if (dist < ideal - 70) e.x -= e.facing * Math.min(e.speed, 170) * dt;
      if (e.cd <= 0 && dist < 760 && (e.kind !== 'skirmisher' || dist > 150)) {
        if (e.kind === 'skirmisher') {
          // long, visible wind-up before the javelin leaves the hand
          e.state = 'windup';
          e.timer = e.windup;
          e.rangedShot = true;
        } else {
          enemyShoot(game, e);
          e.cd = e.cdBase;
        }
      }
    } else if (!leaping) {
      if (dist > e.range) e.x += Math.sign(dx) * e.speed * dt;
      else if (e.cd <= 0) {
        e.state = 'windup';
        e.timer = e.windup;
      }
    }

    e.x = clamp(e.x, 20, ARENA.w - 20 - e.w);
    holdFormation(game, e, dt);
  }
}

// light separation so troops do not stack into one blob
function holdFormation(game, e, dt) {
  for (const o of game.enemies) {
    if (o === e || o.dead) continue;
    const gap = Math.abs(o.x - e.x);
    if (gap < e.w * 0.55 && Math.abs(o.y - e.y) < 8) {
      e.x += (e.x < o.x ? -1 : 1) * 40 * dt;
    }
  }
}

export function enemyFooting(game, e, dt) {
  e.vy += GRAVITY * dt;
  const prevBottom = e.y + e.h;
  e.y += e.vy * dt;
  e.onGround = false;
  if (e.vy < 0) return;
  for (const pl of PLATFORMS) {
    if (e.x + e.w > pl.x + 6 && e.x < pl.x + pl.w - 6 && prevBottom <= pl.y + 8 && e.y + e.h >= pl.y) {
      e.y = pl.y - e.h;
      e.vy = 0;
      e.onGround = true;
      return;
    }
  }
  if (e.y + e.h >= ARENA.groundY) {
    e.y = ARENA.groundY - e.h;
    e.vy = 0;
    e.onGround = true;
  }
}

// When the player is up on a deck above them, troops hop after them and
// steer in the air, so height is no longer a safe place to hide. A horse
// steers clumsily in the air and lands heavily, so it trails behind.
export function enemyLeap(game, e, dt) {
  const p = game.player;
  const gap = e.y + e.h - (p.y + p.h);
  if (gap < 40) return false;
  const dir = Math.sign(p.x + p.w / 2 - (e.x + e.w / 2));
  const steer = e.mount ? 90 : LEAP;
  if (!e.onGround) {
    if (dir) e.x += dir * steer * dt;
    return true;
  }
  e.jumpCd = Math.max(0, e.jumpCd - dt);
  if (e.jumpCd > 0) return true;
  e.facing = dir || e.facing;
  e.vy = e.mount ? -900 : -1000;
  e.onGround = false;
  e.jumpCd = e.mount ? 0.95 : 0.55;
  e.state = 'idle';
  return true;
}

// The rider keeps a jousting gap: ride closer from afar, lower the lance at
// range, jab when you crowd it, and back off while the lance is spent.
function cavalryPace(game, e, dist, dt) {
  if (!e.onGround) return;
  if (dist > 470) {
    e.x += e.facing * e.speed * dt;
    return;
  }
  if (e.cd > 0) {
    if (dist < 120) e.x -= e.facing * Math.min(e.speed, 140) * dt;
    return;
  }
  e.state = 'windup';
  if (dist < 150) {
    e.timer = 0.42;
    return;
  }
  e.timer = e.windup;
  e.charging = true;
}

function startCharge(game, e) {
  const charge = ENEMY_TYPES[e.kind].charge;
  e.state = 'charge';
  e.timer = charge.time;
  e.vx = e.facing * charge.speed;
  e.hitCharge = false;
  game.shake = Math.min(1.15, game.shake + 0.24);
  game.burst(e.x + e.w / 2, e.y + e.h, '#e8d3a8', 12, 200);
}

function cavalryCharge(game, e, dt) {
  e.x = clamp(e.x + e.vx * dt, 20, ARENA.w - 20 - e.w);
  enemyFooting(game, e, dt);
  if (!e.hitCharge) {
    const p = game.player;
    const box = {
      x: e.facing > 0 ? e.x + e.w * 0.5 : e.x - 30,
      y: e.y + 10,
      w: e.w * 0.5 + 30,
      h: e.h - 14,
    };
    if (overlap(box, p)) {
      // one lance hit per pass, never a chain of them
      e.hitCharge = true;
      game.hurtPlayer(e.dmg * 1.2, e.facing, e);
    }
  }
  e.timer -= dt;
  if (e.timer <= 0) {
    e.state = 'idle';
    e.vx = 0;
    e.cd = e.cdBase;
    game.puff(e.x + e.w / 2, e.y + e.h, 8);
  }
}

export function enemyStrike(game, e) {
  const p = game.player;
  const cx = e.x + e.w / 2;
  e.open = 0.5; // shields stay low for a beat after a swing

  if (e.rangedShot) {
    e.rangedShot = false;
    enemyShoot(game, e);
    return;
  }

  if (e.kind === 'brute') {
    game.shockwave(cx, 'both');
    game.shake = Math.min(1.2, game.shake + 0.3);
    return;
  }

  if (e.kind === 'cavalry') {
    const box = {
      x: e.facing > 0 ? e.x + e.w * 0.45 : e.x - 34,
      y: e.y + 16,
      w: e.w * 0.55 + 34,
      h: e.h - 22,
    };
    if (overlap(box, p)) game.hurtPlayer(e.dmg * 0.85, e.facing, e);
    game.burst(e.facing > 0 ? box.x + box.w : box.x, box.y + box.h / 2, '#ffe6b0', 8, 170);
    return;
  }

  const reach = 58;
  const box = {
    x: e.facing > 0 ? e.x + e.w - 8 : e.x - reach,
    y: e.y + 4,
    w: reach + 8,
    h: e.h - 4,
  };
  if (overlap(box, p)) game.hurtPlayer(e.dmg, e.facing, e);
  game.burst(box.x + box.w / 2, box.y + box.h / 2, '#ffe6b0', 6, 150);
}

function enemyShoot(game, e) {
  const p = game.player;
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  const ang = Math.atan2(p.y + p.h / 2 - cy, p.x + p.w / 2 - cx);

  if (e.kind === 'skirmisher') {
    const spd = 720;
    game.projectiles.push({
      x: cx - 12, y: cy - 4, w: 24, h: 8,
      vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      dmg: e.dmg, owner: 'enemy', kind: 'javelin', life: 2.2, color: '#c9a86a',
    });
    return;
  }

  if (e.kind === 'archer') {
    const spd = 540;
    game.projectiles.push({
      x: cx - 7, y: cy - 3, w: 14, h: 6,
      vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      dmg: e.dmg, owner: 'enemy', kind: 'arrow', life: 2.4, color: '#d8c4a0',
    });
  } else {
    const spd = 340;
    game.projectiles.push({
      x: cx - 14, y: cy - 14, w: 28, h: 28,
      vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      dmg: e.dmg, owner: 'enemy', kind: 'fire', life: 2.6, color: '#ff7a3c',
    });
  }
}
