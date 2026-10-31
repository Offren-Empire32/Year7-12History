import { ARENA } from './config';
import { clamp, pick, overlap } from './helpers';
import { spawnEnemy } from './enemies';

// Each world is held by a caliphate: its own move set, its own voice, and
// three phases that tighten the pressure as its health falls. The fight is
// long by design — damage stays modest, so length rather than burst is the
// threat.
const dmgScale = (game) => 1 + game.worldIndex * 0.22;

function say(game, b, kind) {
  const lines = b.lines || {};
  const pool = kind === 'taunts' ? lines.taunts || [] : [lines[kind]];
  const text = pick(pool.filter(Boolean));
  if (text) b.say = { text, t: kind === 'taunts' ? 2.8 : 3.4 };
}

export function startBoss(game) {
  const b = game.world.boss;
  const size = b.size || 138;
  game.boss = {
    name: b.name,
    title: b.title,
    kind: b.kind,
    flag: b.flag,
    lines: b.lines,
    x: ARENA.w / 2 - size / 2,
    y: ARENA.groundY - size,
    w: size,
    h: size,
    hp: b.hp,
    maxHp: b.hp,
    facing: -1,
    state: 'enter',
    timer: 2.4,
    cd: 0.9,
    contactCd: 0,
    flash: 0,
    phase: 1,
    vx: 0,
    action: null,
    combo: 0,
    swing: 0,
    say: null,
    tauntCd: 4,
    actions: b.actions,
    actions2: b.actions2 || b.actions,
    move: b.move || 62,
    aura: b.aura,
    glow: b.glow,
  };
  game.banner = { text: b.name, sub: b.title, t: 3.6 };
  game.shake = 1.5;
  game.burst(ARENA.w / 2, ARENA.groundY - 60, '#ffd9a2', 40, 340);
  say(game, game.boss, 'intro');
}

function pickAction(game) {
  const b = game.boss;
  return pick(b.phase === 1 ? b.actions : b.actions2);
}

function phaseShift(game, b, label) {
  game.shake = 1.4;
  game.burst(b.x + b.w / 2, b.y + b.h / 2, b.aura, 36, 340);
  game.ring(b.x + b.w / 2, b.y + b.h / 2, b.aura, 22);
  game.banner = { text: label, sub: `${b.name} answers in kind`, t: 2.2 };
}

export function updateBoss(game, dt) {
  const b = game.boss;
  const p = game.player;
  if (!b) return;

  b.flash = Math.max(0, b.flash - dt);
  b.contactCd = Math.max(0, b.contactCd - dt);
  b.swing = Math.max(0, b.swing - dt);
  b.tauntCd = Math.max(0, b.tauntCd - dt);
  if (b.say) {
    b.say.t -= dt;
    if (b.say.t <= 0) b.say = null;
  }

  const ratio = b.hp / b.maxHp;
  if (b.phase === 1 && ratio <= 0.6) {
    b.phase = 2;
    phaseShift(game, b, 'Enraged');
    say(game, b, 'phase');
  } else if (b.phase === 2 && ratio <= 0.3) {
    b.phase = 3;
    phaseShift(game, b, 'Furious');
    say(game, b, 'final');
  }

  b.facing = p.x + p.w / 2 < b.x + b.w / 2 ? -1 : 1;

  if (b.state !== 'enter' && overlap(b, p) && b.contactCd <= 0) {
    game.hurtPlayer(7 * (1 + game.worldIndex * 0.25), Math.sign(p.x - b.x) || 1, b);
    b.contactCd = 0.9;
  }

  if (b.state === 'enter') {
    b.timer -= dt;
    if (b.timer <= 0) {
      b.state = 'idle';
      b.cd = 0.8;
    }
    return;
  }

  if (b.state === 'combo') {
    b.timer -= dt;
    if (b.timer <= 0) {
      MOVES.sweep(game, b);
      b.combo -= 1;
      if (b.combo > 0) {
        b.timer = 0.26;
      } else {
        b.state = 'recover';
        b.timer = 0.75;
      }
    }
    return;
  }

  if (b.state === 'charge') {
    b.x = clamp(b.x + b.vx * dt, 50, ARENA.w - 50 - b.w);
    b.timer -= dt;
    if (b.timer <= 0) {
      b.state = 'recover';
      b.timer = 0.7;
      b.vx = 0;
      game.shake = Math.min(1.2, game.shake + 0.5);
    }
    return;
  }

  if (b.state === 'idle') {
    const delta = p.x + p.w / 2 - (b.x + b.w / 2);
    if (Math.abs(delta) > 130) {
      b.x = clamp(b.x + Math.sign(delta) * b.move * dt, 50, ARENA.w - 50 - b.w);
    }
    b.cd -= dt;
    if (b.cd <= 0) {
      b.state = 'telegraph';
      b.timer = b.phase >= 3 ? 0.5 : b.phase === 2 ? 0.64 : 0.84;
      b.action = pickAction(game);
    }
    return;
  }

  if (b.state === 'telegraph') {
    b.timer -= dt;
    if (b.timer <= 0) {
      const move = MOVES[b.action] || MOVES.sweep;
      move(game, b);
      if (b.state === 'telegraph') {
        b.state = 'recover';
        b.timer = 0.8;
      }
    }
    return;
  }

  if (b.state === 'recover') {
    b.timer -= dt;
    if (b.timer <= 0) {
      b.state = 'idle';
      b.cd = b.phase >= 3 ? 0.62 : b.phase === 2 ? 0.9 : 1.25;
      if (b.tauntCd <= 0 && Math.random() < 0.5) {
        say(game, b, 'taunts');
        b.tauntCd = 9;
      }
    }
  }
}

const MOVES = {
  // a wide cut of the blade — the caliphate's everyday answer
  sweep(game, b) {
    const reach = 200;
    const box = {
      x: b.facing > 0 ? b.x + b.w - 30 : b.x - reach + 30,
      y: b.y + 18,
      w: reach,
      h: b.h - 20,
    };
    if (overlap(box, game.player)) game.hurtPlayer(15 * dmgScale(game), b.facing, b);
    game.burst(box.x + box.w / 2, box.y + box.h / 2, '#ffe6b0', 12, 240);
    game.shake = Math.min(1.2, game.shake + 0.4);
    b.swing = 0.3;
  },

  // three cuts in quick succession instead of one
  crescent(game, b) {
    b.state = 'combo';
    b.combo = 3;
    b.timer = 0.22;
  },

  slam(game, b) {
    const cx = b.x + b.w / 2;
    game.shockwave(cx - 37, 'both');
    game.shake = 1;
    game.burst(cx, ARENA.groundY - 20, '#ffd9a2', 26, 320);
  },

  summon(game, b) {
    // a long fight must not bury the player under reinforcements
    if (game.enemies.filter((e) => !e.dead).length >= 6) return MOVES.fan(game, b);
    const key = pick(game.world.roster);
    spawnEnemy(game, key, 'left');
    spawnEnemy(game, key, 'right');
  },

  fan(game, b) {
    const p = game.player;
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    const base = Math.atan2(p.y + p.h / 2 - cy, p.x + p.w / 2 - cx);
    for (let i = -2; i <= 2; i++) {
      const a = base + i * 0.2;
      game.projectiles.push({
        x: cx - 13, y: cy - 13, w: 26, h: 26,
        vx: Math.cos(a) * 380, vy: Math.sin(a) * 380,
        dmg: 8 * dmgScale(game), owner: 'enemy', kind: 'fire', life: 3, color: b.aura,
      });
    }
    game.shake = Math.min(1.1, game.shake + 0.25);
  },

  // a low wall of grit that races along the ground: jump it or take a perch
  sandstorm(game, b) {
    const cx = b.x + b.w / 2;
    const dir = game.player.x + game.player.w / 2 < cx ? -1 : 1;
    for (let i = 0; i < 6; i++) {
      const row = i % 3;
      const col = Math.floor(i / 3);
      game.projectiles.push({
        x: cx + dir * (30 + col * 34),
        y: ARENA.groundY - 74 - row * 30,
        w: 30, h: 30,
        vx: dir * 320, vy: 0,
        dmg: 7 * dmgScale(game), owner: 'enemy', kind: 'fire', life: 4.5, color: '#e0b878',
      });
    }
    game.shake = 0.7;
  },

  ring(game, b) {
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      game.projectiles.push({
        x: cx - 13, y: cy - 13, w: 26, h: 26,
        vx: Math.cos(a) * 340, vy: Math.sin(a) * 340,
        dmg: 8 * dmgScale(game), owner: 'enemy', kind: 'fire', life: 3, color: b.aura,
      });
    }
    game.ring(cx, cy, b.aura, 20);
  },

  meteor(game, b) {
    const px = game.player.x + game.player.w / 2;
    for (let i = 0; i < 3; i++) {
      const x = clamp(px + (i - 1) * 170, 90, ARENA.w - 90);
      game.projectiles.push({
        x: x - 16, y: -60 - i * 45, w: 32, h: 32,
        vx: 0, vy: 660,
        dmg: 11 * dmgScale(game), owner: 'enemy', kind: 'fire', life: 4, color: '#ff7a3c',
      });
    }
  },

  // one heavy shell with two lighter ones falling beside it
  cannon(game, b) {
    const target = game.player.x + game.player.w / 2;
    const shell = (x, w, dmg, vy) =>
      game.projectiles.push({
        x: clamp(x, 80, ARENA.w - 80) - w / 2, y: -70, w, h: w,
        vx: 0, vy, dmg: dmg * dmgScale(game),
        owner: 'enemy', kind: 'fire', life: 5, color: '#ffa257',
      });
    shell(target, 56, 16, 700);
    shell(target - 210, 34, 10, 780);
    shell(target + 210, 34, 10, 780);
    game.shake = Math.min(1.2, game.shake + 0.5);
  },

  // a tight musket line, straight down the arena
  volley(game, b) {
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    for (let i = -2; i <= 2; i++) {
      const a = i * 0.12;
      game.projectiles.push({
        x: cx - 8, y: cy - 8, w: 16, h: 16,
        vx: Math.cos(a) * 820 * b.facing, vy: Math.sin(a) * 820,
        dmg: 6 * dmgScale(game), owner: 'enemy', kind: 'fire', life: 2.4, color: '#ffe6b0',
      });
    }
    game.shake = Math.min(1.1, game.shake + 0.3);
  },

  // step sideways through the gate and strike where it opens
  blink(game, b) {
    const cx = b.x + b.w / 2;
    game.burst(cx, b.y + b.h / 2, b.aura, 30, 300);
    b.x = clamp(
      game.player.x + game.player.w / 2 - b.w / 2 + (Math.random() < 0.5 ? -190 : 190),
      50,
      ARENA.w - 50 - b.w
    );
    b.state = 'recover';
    b.timer = 0.55;
    game.shockwave(b.x + b.w / 2 - 37, 'both');
    game.burst(b.x + b.w / 2, b.y + b.h / 2, b.aura, 26, 320);
    game.shake = 1.1;
  },

  // a scorching beam that races along the floor — take to the air
  line(game, b) {
    const dir = b.facing;
    game.projectiles.push({
      x: dir > 0 ? b.x + b.w : b.x - 1500,
      y: ARENA.groundY - 48,
      w: 1500, h: 48,
      vx: dir * 720, vy: 0,
      dmg: 13 * dmgScale(game), owner: 'enemy', kind: 'line', life: 3.4, color: b.aura,
    });
    game.shake = Math.min(1.2, game.shake + 0.45);
  },
};

export function hurtBoss(game, dmg) {
  const b = game.boss;
  if (!b) return;
  b.hp -= dmg;
  b.flash = 0.15;
  game.shake = Math.min(1.2, game.shake + 0.1);
  game.burst(b.x + b.w / 2, b.y + b.h / 2, '#ffd9a2', 7, 180);
  if (b.hp <= 0) {
    b.hp = 0;
    game.burst(b.x + b.w / 2, b.y + b.h / 2, b.aura, 60, 440);
    game.boss = null;
    game.enemies = [];
    game.projectiles = [];
    game.status = 'clearing';
    game.phaseTimer = 2.6;
    game.phase = 'done';
    game.banner = { text: 'Champion fallen', sub: (b.lines && b.lines.defeat) || 'The arena is yours', t: 3.4 };
    game.shake = 1.7;
    game.score += 700;
    game.addGold(200);
  }
}
