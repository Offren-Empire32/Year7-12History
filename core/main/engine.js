import { ARENA, PLATFORMS, CHARACTERS, WORLDS, GRAVITY } from './config';
import { GUARD, resolveGuardHit } from './shield';
import { pickSkillOffers, skillById } from './skills';
import { ARMORY, armoryPrice } from './armory';
import { ALCHEMY, BUFF_TIME, potionById } from './alchemy';
import { spawnCompanion, spawnBoat, updateCompanion, updateBoat } from './companion';
import { clamp, pick, rnd, overlap } from './helpers';
import { spawnEnemy, updateEnemies } from './enemies';
import { startBoss, updateBoss, hurtBoss } from './boss';

export const MAX_WAVES = 20;
// the wave a troop type first appears in
const UNLOCK = {
  spearman: 1,
  archer: 2,
  shieldman: 3,
  raider: 5,
  cavalry: 6,
  brute: 8,
  skirmisher: 10,
  caster: 12,
};

export class Game {
  constructor({ characterId, worldIndex = 0, carry = null } = {}) {
    this.char = CHARACTERS.find((c) => c.id === characterId) || CHARACTERS[0];
    this.worldIndex = clamp(worldIndex, 0, WORLDS.length - 1);
    this.world = WORLDS[this.worldIndex];
    this.reset();
    this.applyCarry(carry);
  }

  /* ---------------- career: gold, armour and blessings ---------------- */

  applyCarry(carry) {
    if (!carry) return;
    this.gold = carry.gold || 0;
    this.score = carry.score || 0;
    this.up = { ...(carry.up || {}) };
    if (this.up.plate) this.player.maxHp += this.up.plate * 20;
    if (this.up.aegis) this.player.guard = Math.min(this.guardMax(), this.player.guard + this.up.aegis * 15);
    for (const id of carry.skills || []) this.pickSkill(id, { free: true });
    this.player.hp = this.player.maxHp;
  }

  getCarry() {
    return { gold: this.gold, score: this.score, up: { ...this.up }, skills: [...this.skills] };
  }

  reset() {
    this.input = { left: false, right: false, down: false, jump: false, attack: false, ability: false, block: false, talk: false };
    this.pressed = { jump: false, attack: false, ability: false, talk: false };
    this.time = 0;
    this.paused = false;
    this.status = 'playing';
    this.phase = 'intro';
    this.phaseTimer = 2.2;
    this.wave = 0;
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.enemies = [];
    this.boss = null;
    this.projectiles = [];
    this.particles = [];
    this.shake = 0;
    this.score = 0;
    this.gold = 0;
    this.up = {};
    this.skills = [];
    this.skillSet = new Set();
    this.shopOffers = [];
    this.shopTaken = false;
    this.reviveReady = false;
    this.pickups = [];
    this.bolts = [];
    this.ally = null;
    this.boat = null;
    this.auraT = 0;
    this.meteorT = 8;
    this.campNpc = null;
    this.treasure = null;
    this.nearCamp = false;
    this.treasureLoot = [];
    this.alchStock = [];
    this.alchBought = {};
    this.buffs = { wrath: 0, stride: 0, ward: 0, venom: 0 };
    this._eid = 0;
    this.banner = { text: this.world.name, sub: 'Hold the arena', t: 2.4 };
    this.player = {
      x: ARENA.w / 2 - 28,
      y: ARENA.groundY - 56,
      w: 56,
      h: 56,
      vx: 0,
      vy: 0,
      hp: this.char.hp,
      maxHp: this.char.hp,
      facing: 1,
      onGround: true,
      jumps: 2,
      attackCd: 0,
      abilityCd: 0,
      shield: 0,
      spin: 0,
      guard: GUARD.max,
      guardBroken: 0,
      guardHold: GUARD.regenDelay,
      blocking: false,
      blockFlash: 0,
      dropTimer: 0,
      groundRef: 'ground',
      invuln: 0,
      flash: 0,
      swing: null,
    };
  }

  press(action) {
    if (!(action in this.input)) return;
    this.input[action] = true;
    if (action !== 'left' && action !== 'right' && action !== 'block') this.pressed[action] = true;
  }

  release(action) {
    if (!(action in this.input)) return;
    this.input[action] = false;
  }

  /* ---------------- modifiers from gold and blessings ---------------- */

  hasSk(id) {
    return this.skillSet.has(id);
  }

  addGold(amount) {
    const mul = (1 + (this.up.banner || 0) * 0.2) * (this.hasSk('greed') ? 1.4 : 1);
    this.gold += Math.max(0, Math.round(amount * mul));
  }

  dmgMul() {
    return (1 + (this.up.whetstone || 0) * 0.12) * (this.buffs.wrath > 0 ? 1.6 : 1);
  }

  speedMul() {
    return (
      1 +
      (this.up.greaves || 0) * 0.08 +
      (this.hasSk('fleet') ? 0.12 : 0) +
      (this.buffs.stride > 0 ? 0.3 : 0)
    );
  }

  atkCdMul() {
    return (
      (1 - (this.up.gauntlets || 0) * 0.1) *
      (this.hasSk('frenzy') ? 0.85 : 1) *
      (this.buffs.stride > 0 ? 0.8 : 1)
    );
  }

  abilityCdMul() {
    return (1 - (this.up.reliquary || 0) * 0.12) * (this.hasSk('zeal') ? 0.75 : 1);
  }

  guardMax() {
    return Math.round((GUARD.max + (this.up.aegis || 0) * 15) * (this.buffs.ward > 0 ? 1.5 : 1));
  }

  guardRegen() {
    return GUARD.regen * (1 + (this.up.aegis || 0) * 0.25) * (this.hasSk('bulwark') ? 1.5 : 1);
  }

  armorDr() {
    return Math.min(0.4, (this.up.plate || 0) * 0.04);
  }

  maxJumps() {
    return this.hasSk('triplejump') ? 3 : 2;
  }

  /* ---------------- fx helpers ---------------- */

  burst(x, y, color, n = 10, speed = 220) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rnd(speed * 0.25, speed);
      this.particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 40,
        life: rnd(0.32, 0.72),
        max: 0.72,
        color,
        size: rnd(2, 5.5),
      });
    }
    if (this.particles.length > 420) this.particles.splice(0, this.particles.length - 420);
  }

  ring(x, y, color, n = 24) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * 300,
        vy: Math.sin(a) * 300,
        life: 0.55,
        max: 0.55,
        color,
        size: 4,
      });
    }
  }

  puff(x, y, n = 6) {
    for (let i = 0; i < n; i++) {
      this.particles.push({
        x: x + rnd(-14, 14),
        y,
        vx: rnd(-60, 60),
        vy: rnd(-90, -20),
        life: rnd(0.2, 0.4),
        max: 0.4,
        color: '#e8d3a8',
        size: rnd(2, 4),
      });
    }
  }

  updateParticles(dt) {
    for (const pt of this.particles) {
      pt.vy += 900 * dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
    }
    this.particles = this.particles.filter((pt) => pt.life > 0);
  }

  /* ---------------- main loop ---------------- */

  update(dt) {
    if (this.paused) return;
    this.time += dt;
    this.shake = Math.max(0, this.shake - dt * 2.6);
    if (this.banner) {
      this.banner.t -= dt;
      if (this.banner.t <= 0) this.banner = null;
    }
    this.updateParticles(dt);

    if (this.status === 'playing') {
      this.updatePlayer(dt);
      updateEnemies(this, dt);
      if (this.boss) updateBoss(this, dt);
      this.updateProjectiles(dt);
      this.updatePickups(dt);
      updateCompanion(this, dt);
      this.updateSkillTicks(dt);
      this.updateCamp(dt);
      for (const k of Object.keys(this.buffs)) {
        if (this.buffs[k] > 0) this.buffs[k] = Math.max(0, this.buffs[k] - dt);
      }
      this.updateDirector(dt);
    } else if (this.status === 'clearing') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        this.status = this.worldIndex < WORLDS.length - 1 ? 'worldclear' : 'victory';
      }
    }

    this.enemies = this.enemies.filter((e) => !e.dead);
    this.projectiles = this.projectiles.filter((pr) => pr.life > 0);
    this.bolts = this.bolts.filter((b) => (b.t -= dt) > 0);
    updateBoat(this, dt);
    this.pressed.jump = false;
    this.pressed.attack = false;
    this.pressed.ability = false;
    this.pressed.down = false;
    this.pressed.talk = false;
  }

  /* ---------------- player ---------------- */

  updatePlayer(dt) {
    const p = this.player;
    const c = this.char;

    p.attackCd = Math.max(0, p.attackCd - dt);
    p.abilityCd = Math.max(0, p.abilityCd - dt);
    p.invuln = Math.max(0, p.invuln - dt);
    p.flash = Math.max(0, p.flash - dt);
    p.shield = Math.max(0, p.shield - dt);
    p.spin = Math.max(0, p.spin - dt);
    p.blockFlash = Math.max(0, p.blockFlash - dt);
    p.guardBroken = Math.max(0, p.guardBroken - dt);

    const spec = c.shield;
    p.blocking = this.input.block && p.guard > 0 && p.guardBroken <= 0;
    if (p.blocking) {
      p.guardHold = 0;
      p.guard -= spec.drain * dt;
      if (p.guard <= 0) this.breakGuard(0);
    } else {
      p.guardHold += dt;
      if (p.guardHold > GUARD.regenDelay) p.guard = Math.min(this.guardMax(), p.guard + this.guardRegen() * dt);
    }
    if (this.hasSk('regen') && p.hp > 0) this.healPlayer(1 * dt);

    const dir = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    if (dir) p.facing = dir;
    p.vx =
      dir *
      c.speed *
      this.speedMul() *
      (p.shield > 0 ? 0.85 : 1) *
      (p.guardBroken > 0 ? GUARD.breakSlow : 1) *
      (p.blocking ? spec.move : 1);

    if (this.pressed.jump && !p.blocking && (p.onGround || p.jumps > 0)) {
      p.vy = c.jump;
      p.jumps = p.onGround ? 1 : p.jumps - 1;
      p.onGround = false;
      this.puff(p.x + p.w / 2, p.y + p.h, 7);
    }

    p.vy += GRAVITY * dt;

    // holding down steps off the platform you are standing on
    p.dropTimer = Math.max(0, p.dropTimer - dt);
    if (this.input.down && !p.blocking && p.onGround && p.groundRef === 'platform') {
      p.dropTimer = 0.3;
      p.vy = 60;
      p.y += 10;
      p.onGround = false;
      p.groundRef = 'ground';
      this.puff(p.x + p.w / 2, p.y + p.h, 5);
    }

    p.x = clamp(p.x + p.vx * dt, 24, ARENA.w - 24 - p.w);
    const prevBottom = p.y + p.h;
    p.y += p.vy * dt;
    p.onGround = false;

    if (p.vy >= 0) {
      const bottom = p.y + p.h;
      for (const pl of PLATFORMS) {
        if (p.dropTimer > 0) break;
        if (p.x + p.w > pl.x + 6 && p.x < pl.x + pl.w - 6 && prevBottom <= pl.y + 8 && bottom >= pl.y) {
          p.y = pl.y - p.h;
          p.vy = 0;
          p.onGround = true;
          p.jumps = this.maxJumps();
          p.groundRef = 'platform';
        }
      }
      if (p.y + p.h >= ARENA.groundY) {
        p.y = ARENA.groundY - p.h;
        p.vy = 0;
        p.onGround = true;
        p.jumps = this.maxJumps();
        p.groundRef = 'ground';
      }
    }

    if (p.swing) {
      p.swing.t += dt;
      this.resolveSwing(p.swing);
      if (p.swing.t >= p.swing.dur) p.swing = null;
    }

    if (this.input.attack && p.attackCd <= 0 && !p.swing && (!p.blocking || spec.strikeWhileGuarding)) this.attack();
    if (this.pressed.ability && p.abilityCd <= 0 && !p.blocking) this.useAbility();
  }

  attack() {
    const p = this.player;
    const w = this.char.weapon;
    p.attackCd = w.cd * this.atkCdMul();
    if (w.type === 'melee') {
      p.swing = { t: 0, dur: w.dur, dmg: w.dmg, reach: w.reach, h: w.h, hits: new Set() };
    } else {
      this.spawnPlayerShot();
    }
  }

  resolveSwing(sw) {
    const p = this.player;
    const box = {
      x: p.facing > 0 ? p.x + p.w - 12 : p.x - sw.reach + 12,
      y: p.y + p.h / 2 - sw.h / 2,
      w: sw.reach,
      h: sw.h,
    };
    for (const e of this.enemies) {
      if (e.dead || sw.hits.has(e.id)) continue;
      if (overlap(box, e)) {
        sw.hits.add(e.id);
        this.damageEnemy(e, sw.dmg, p.facing);
      }
    }
    if (this.boss && !sw.hits.has('boss') && overlap(box, this.boss)) {
      sw.hits.add('boss');
      this.damageBoss(sw.dmg);
    }
  }

  spawnPlayerShot() {
    const p = this.player;
    const w = this.char.weapon;
    const cx = p.x + p.w / 2 + p.facing * 30;
    const cy = p.y + p.h / 2 - 4;
    const pierce = this.hasSk('pierce') ? 2 : 1;
    const lanes = this.hasSk('twinshot') ? [-15, 15] : [0];
    for (const lane of lanes) {
      if (w.kind === 'crossbow') {
        this.projectiles.push({
          x: cx, y: cy + lane, w: 22, h: 6,
          vx: p.facing * w.speed, vy: 0,
          dmg: w.dmg, owner: 'player', kind: 'arrow', life: w.life,
          color: '#ffe6b0', pierce, hitIds: new Set(),
        });
      } else {
        this.projectiles.push({
          x: cx - 10, y: cy + lane - 10, w: 20, h: 20,
          vx: p.facing * w.speed * 0.8, vy: 0,
          dmg: w.dmg, owner: 'player', kind: 'ember', life: w.life,
          homing: 1, color: '#ff8a4c', pierce, hitIds: new Set(),
        });
      }
    }
  }

  useAbility() {
    const p = this.player;
    const ab = this.char.ability;
    p.abilityCd = ab.cd * this.abilityCdMul();
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;

    if (ab.kind === 'whirl') {
      p.spin = 0.42;
      p.invuln = Math.max(p.invuln, 0.55);
      const R = 168;
      for (const e of [...this.enemies]) {
        if (e.dead) continue;
        if (Math.hypot(e.x + e.w / 2 - cx, e.y + e.h / 2 - cy) < R + e.w / 2) {
          this.damageEnemy(e, this.char.weapon.dmg * 1.8, Math.sign(e.x + e.w / 2 - cx) || 1);
        }
      }
      if (this.boss && Math.hypot(this.boss.x + this.boss.w / 2 - cx, this.boss.y + this.boss.h / 2 - cy) < R + this.boss.w / 2) {
        this.damageBoss(this.char.weapon.dmg * 1.6);
      }
      this.ring(cx, cy, '#ffe6b0', 30);
      this.shake = Math.min(1.4, this.shake + 0.7);
    } else if (ab.kind === 'bulwark') {
      p.shield = 4.2;
      for (const e of [...this.enemies]) {
        const dx = e.x + e.w / 2 - cx;
        const dy = e.y + e.h / 2 - cy;
        if (Math.hypot(dx, dy) < 240) this.damageEnemy(e, this.char.weapon.dmg * 0.5, Math.sign(dx) || 1);
      }
      this.ring(cx, cy, '#9fe0ff', 26);
    } else if (ab.kind === 'volley') {
      for (let i = -3; i <= 3; i++) {
        const a = (Math.PI / 180) * (i * 11);
        this.projectiles.push({
          x: cx - 8, y: cy - 8, w: 20, h: 6,
          vx: Math.cos(a) * 1000 * p.facing,
          vy: Math.sin(a) * 1000,
          dmg: this.char.weapon.dmg * 0.95,
          owner: 'player', kind: 'arrow', life: 1.1, color: '#ffe6b0',
        });
      }
    } else if (ab.kind === 'nova') {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        this.projectiles.push({
          x: cx - 10, y: cy - 10, w: 20, h: 20,
          vx: Math.cos(a) * 520, vy: Math.sin(a) * 520,
          dmg: this.char.weapon.dmg * 0.85,
          owner: 'player', kind: 'ember', life: 1.7, homing: 1, color: '#ff8a4c',
        });
      }
      this.ring(cx, cy, '#ffb27a', 22);
    }
  }

  healPlayer(amount) {
    const p = this.player;
    p.hp = Math.min(p.maxHp, p.hp + amount);
  }

  breakGuard(dirX = 0) {
    const p = this.player;
    if (p.guardBroken > 0) return;
    p.guard = 0;
    p.guardBroken = GUARD.breakLock * (this.hasSk('bulwark') ? 0.65 : 1);
    p.guardHold = 0;
    p.blocking = false;
    p.invuln = Math.max(p.invuln, 0.35);
    p.x = clamp(p.x + dirX * 16, 24, ARENA.w - 24 - p.w);
    this.shake = Math.min(1.3, this.shake + 0.6);
    this.burst(p.x + p.w / 2 + p.facing * 18, p.y + p.h / 2, this.char.shield.color, 24, 300);
    this.ring(p.x + p.w / 2, p.y + p.h / 2, '#ff6b5a', 14);
  }

  hurtPlayer(amount, dirX = 0, source = null) {
    const p = this.player;
    if (this.status !== 'playing' || p.invuln > 0) return;

    if (source && this.hasSk('reflect') && Math.random() < 1 / 9) {
      p.invuln = 0.4;
      this.ring(p.x + p.w / 2, p.y + p.h / 2, '#9fe0ff', 14);
      this.hitSource(source, 10 * (1 + this.worldIndex * 0.15), -dirX || 1);
      return;
    }

    const hit = resolveGuardHit(this, amount, dirX, source);
    if (hit.blocked) {
      p.x = clamp(p.x + dirX * 8, 24, ARENA.w - 24 - p.w);
      if (this.hasSk('thorns')) this.hitSource(source, 7, -dirX || 1);
      return;
    }
    const dmg = (p.shield > 0 ? hit.damage * 0.25 : hit.damage) * (1 - this.armorDr());
    if (this.hasSk('thorns')) this.hitSource(source, 7, -dirX || 1);
    p.hp = Math.max(0, p.hp - dmg);
    p.invuln = 0.65;
    p.flash = 0.18;
    p.x = clamp(p.x + dirX * 22, 24, ARENA.w - 24 - p.w);
    this.shake = Math.min(1.3, this.shake + 0.45);
    this.burst(p.x + p.w / 2, p.y + p.h / 2, p.shield > 0 ? '#9fe0ff' : '#ff6b5a', 14, 240);
    if (p.hp <= 0) {
      if (this.reviveReady) {
        this.reviveReady = false;
        p.hp = Math.round(p.maxHp * 0.5);
        p.invuln = 2.2;
        this.banner = { text: 'A guardian intervenes', sub: 'You rise again at half strength', t: 2.4 };
        this.ring(p.x + p.w / 2, p.y + p.h / 2, '#fff0c4', 30);
        return;
      }
      this.status = 'dead';
      this.shake = 1.6;
      this.burst(p.x + p.w / 2, p.y + p.h / 2, '#ffd9a2', 40, 380);
    }
  }

  hurtEnemy(e, dmg, dirX = 0, opts = {}) {
    if (e.dead) return;

    // a raised shield swallows most of a frontal blow
    const guarded = e.blockMul > 0 && e.guarding && dirX * e.facing < 0;
    if (guarded) {
      dmg *= e.blockMul;
      e.blockFlash = 0.22;
    }

    e.hp -= dmg;
    if (!opts.soft) {
      e.flash = 0.16;
      e.x = clamp(e.x + dirX * (guarded ? 3 : 12), 16, ARENA.w - 16 - e.w);
      this.burst(e.x + e.w / 2, e.y + e.h / 2, guarded ? '#dfe6ee' : '#ffd9a2', 6, 170);
    }
    if (e.hp <= 0) {
      e.dead = true;
      e.hp = 0;
      this.burst(e.x + e.w / 2, e.y + e.h / 2, e.color, 18, 280);
      this.score += 10;
      this.addGold(e.kind === 'brute' ? 14 : 8);
      if (this.hasSk('explode') && !opts.noChain) this.explode(e.x + e.w / 2, e.y + e.h / 2);
      if (this.hasSk('bread') && Math.random() < 0.22) this.dropBread(e.x + e.w / 2, e.y + e.h / 2);
    }
  }

  /* ---------------- blessings in action ---------------- */

  // Everything the fighter's own weapons do to an enemy passes through here, so
  // damage upgrades, critical strikes and venom all land in one place.
  damageEnemy(e, dmg, dirX = 0) {
    if (e.dead) return;
    let amount = dmg * this.dmgMul();
    if (this.hasSk('crit') && Math.random() < 0.2) {
      amount *= 2;
      this.ring(e.x + e.w / 2, e.y + e.h / 2, '#fff0c4', 10);
    }
    this.hurtEnemy(e, amount, dirX);
    if (e.dead) return;
    if (this.hasSk('lifesteal') && Math.random() < 0.25) this.healPlayer(2);
    if (this.hasSk('poison') || this.buffs.venom > 0) {
      e.poison = Math.max(e.poison, 2.5);
      e.poisonDps = 4 * (1 + this.worldIndex * 0.2);
    }
    if (this.hasSk('burn')) {
      e.burn = Math.max(e.burn, 2);
      e.burnDps = 5 * (1 + this.worldIndex * 0.2);
    }
    if (this.hasSk('zeus') && Math.random() < 0.15) this.lightning(e);
  }

  damageBoss(dmg) {
    if (!this.boss) return;
    let amount = dmg * this.dmgMul();
    if (this.hasSk('crit') && Math.random() < 0.2) amount *= 2;
    hurtBoss(this, amount);
  }

  lightning(e) {
    this.bolts.push({ x: e.x + e.w / 2, y: e.y + e.h / 2, t: 0.26 });
    this.hurtEnemy(e, 18 * (1 + this.worldIndex * 0.2), 0, { soft: true });
    this.shake = Math.min(1.2, this.shake + 0.18);
  }

  explode(x, y) {
    const dmg = 14 * (1 + this.worldIndex * 0.15);
    this.ring(x, y, '#ffb27a', 16);
    this.burst(x, y, '#ffd9a2', 12, 240);
    for (const e of [...this.enemies]) {
      if (e.dead) continue;
      if (Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < 130) {
        this.hurtEnemy(e, dmg, 0, { soft: true, noChain: true });
      }
    }
  }

  hitSource(source, dmg, dirX = 0) {
    if (!source) return;
    if (source.id) this.hurtEnemy(source, dmg, dirX);
    else if (source.maxHp) this.damageBoss(dmg);
  }

  dropBread(x, y, vx = 0, vy = -180) {
    this.pickups.push({ x: x - 13, y: y - 13, w: 26, h: 26, vx, vy, life: 14 });
  }

  updatePickups(dt) {
    const p = this.player;
    for (const it of this.pickups) {
      it.vy += 1500 * dt;
      it.x += it.vx * dt;
      it.y += it.vy * dt;
      it.vx *= 0.98;
      it.life -= dt;
      if (it.y + it.h >= ARENA.groundY) {
        it.y = ARENA.groundY - it.h;
        it.vy = 0;
        it.vx *= 0.6;
      }
      if (p.hp > 0 && overlap(it, p)) {
        it.life = 0;
        this.healPlayer(15);
        this.burst(it.x + 13, it.y + 13, '#ffd9a2', 10, 180);
      }
    }
    this.pickups = this.pickups.filter((it) => it.life > 0);
  }

  updateSkillTicks(dt) {
    const p = this.player;
    if (this.hasSk('aura')) {
      this.auraT += dt;
      if (this.auraT >= 0.6) {
        this.auraT = 0;
        const cx = p.x + p.w / 2;
        const cy = p.y + p.h / 2;
        const dmg = 4 * (1 + this.worldIndex * 0.15);
        for (const e of [...this.enemies]) {
          if (e.dead) continue;
          if (Math.hypot(e.x + e.w / 2 - cx, e.y + e.h / 2 - cy) < 190 + e.w / 2) {
            this.hurtEnemy(e, dmg, 0, { soft: true });
          }
        }
      }
    }
    if (this.hasSk('meteor')) {
      this.meteorT -= dt;
      if (this.meteorT <= 0) {
        const target = this.enemies.length ? pick(this.enemies) : this.boss;
        this.meteorT = 8;
        if (target) {
          this.projectiles.push({
            x: target.x + target.w / 2 - 17,
            y: -40,
            w: 34,
            h: 34,
            vx: 0,
            vy: 900,
            dmg: 24 * (1 + this.worldIndex * 0.15),
            owner: 'player',
            kind: 'meteor',
            life: 4,
            color: '#ffb27a',
            pierce: 1,
            hitIds: new Set(),
          });
        }
      }
    }
  }

  /* ---------------- projectiles ---------------- */

  shockwave(x, dir = 'both') {
    const dmg = 16 * (1 + this.worldIndex * 0.25);
    const make = (vx) =>
      this.projectiles.push({
        x, y: ARENA.groundY - 74, w: 74, h: 74,
        vx, vy: 0, dmg, owner: 'enemy', kind: 'shockwave', life: 1.5, color: '#ffcf7a',
      });
    if (dir === 'both' || dir === 'left') make(-540);
    if (dir === 'both' || dir === 'right') make(540);
  }

  updateProjectiles(dt) {
    const p = this.player;
    for (const pr of this.projectiles) {
      if (pr.homing) {
        let target = null;
        let best = 1e9;
        for (const e of this.enemies) {
          if (e.dead) continue;
          const d = Math.hypot(e.x + e.w / 2 - (pr.x + pr.w / 2), e.y + e.h / 2 - (pr.y + pr.h / 2));
          if (d < best && d < 640) { best = d; target = e; }
        }
        if (!target && this.boss) target = this.boss;
        if (target) {
          const ang = Math.atan2(
            target.y + target.h / 2 - (pr.y + pr.h / 2),
            target.x + target.w / 2 - (pr.x + pr.w / 2)
          );
          const spd = Math.hypot(pr.vx, pr.vy) || 400;
          const k = Math.min(1, 7 * dt);
          pr.vx += (Math.cos(ang) * spd - pr.vx) * k;
          pr.vy += (Math.sin(ang) * spd - pr.vy) * k;
        }
      }
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      pr.life -= dt;

      const box = { x: pr.x, y: pr.y, w: pr.w, h: pr.h };
      if (pr.owner === 'player' || pr.owner === 'ally') {
        for (const e of this.enemies) {
          if (e.dead || e.spawnT > 0) continue;
          if (overlap(box, e)) {
            if (pr.hitIds && pr.hitIds.has(e.id)) continue;
            pr.hitIds?.add(e.id);
            if (pr.owner === 'player') this.damageEnemy(e, pr.dmg, Math.sign(pr.vx) || 1);
            else this.hurtEnemy(e, pr.dmg, Math.sign(pr.vx) || 1);
            this.burst(pr.x + pr.w / 2, pr.y + pr.h / 2, pr.color, 8, 190);
            pr.pierce = (pr.pierce || 1) - 1;
            if (pr.pierce <= 0) pr.life = 0;
            if (pr.life <= 0) break;
          }
        }
        if (pr.life > 0 && pr.owner === 'player' && this.boss && overlap(box, this.boss)) {
          this.damageBoss(pr.dmg);
          this.burst(pr.x + pr.w / 2, pr.y + pr.h / 2, pr.color, 8, 190);
          pr.life = 0;
        }
      } else if (overlap(box, p) && p.invuln <= 0 && this.status === 'playing') {
        this.hurtPlayer(pr.dmg, Math.sign(pr.vx) || 1);
        pr.life = 0;
      }

      if (pr.kind !== 'shockwave' && (pr.y > ARENA.groundY - 6 || pr.x < -80 || pr.x > ARENA.w + 80)) {
        pr.life = 0;
      }
    }
  }

  /* ---------------- waves ---------------- */

  buildWave(n) {
    const roster = this.world.roster.filter((k) => UNLOCK[k] <= n);
    const pool = n < 6 ? roster.filter((k) => k !== 'brute' && k !== 'caster') : roster;
    const usable = pool.length ? pool : roster;
    const count = Math.min(4 + Math.floor(n * 0.8), 16);
    const list = [];
    for (let i = 0; i < count; i++) list.push(pick(usable));
    return list.sort(() => Math.random() - 0.5);
  }

  startWave(n) {
    this.wave = n;
    this.phase = 'fight';
    this.campNpc = null;
    this.treasure = null;
    this.treasureLoot = [];
    this.nearCamp = false;
    this.spawnQueue = this.buildWave(n);
    this.spawnTimer = 0.9;
    if (n === 1 || n % 5 === 0) {
      this.banner = { text: `Wave ${n}`, sub: n === 1 ? 'They come from both sides' : 'The host gathers again', t: 1.7 };
    }
  }

  startBossIntro() {
    this.phase = 'bossintro';
    this.phaseTimer = 2.6;
    this.banner = { text: 'Final wave', sub: 'A champion steps forward', t: 2.4 };
  }

  updateDirector(dt) {
    if (this.phase === 'intro') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) this.startWave(1);
      return;
    }

    if (this.phase === 'fight') {
      this.spawnTimer -= dt;
      const maxAlive = Math.min(4 + Math.floor(this.wave / 3), 9);
      if (this.spawnQueue.length && this.spawnTimer <= 0 && this.enemies.length < maxAlive) {
        const key = this.spawnQueue.shift();
        spawnEnemy(this, key, Math.random() < 0.5 ? 'left' : 'right');
        this.spawnTimer = Math.max(0.45, 1.35 - this.wave * 0.035);
      }
      if (!this.spawnQueue.length && !this.enemies.length) {
        if (this.wave >= MAX_WAVES) {
          this.startBossIntro();
        } else if (this.wave % 2 === 0) {
          this.startCamp();
        } else {
          this.phase = 'clear';
          this.phaseTimer = 1.9;
          this.healPlayer(Math.round(this.player.maxHp * 0.12));
          this.addGold(10 + this.wave * 3);
          this.banner = { text: `Wave ${this.wave} cleared`, sub: 'Catch your breath', t: 1.5 };
        }
      }
      return;
    }

    if (this.phase === 'clear') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) this.startWave(this.wave + 1);
      return;
    }

    if (this.phase === 'bossintro') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        this.spawnBossSafe();
        this.phase = 'boss';
      }
    }
  }

  spawnBossSafe() {
    startBoss(this);
  }

  /* ---------------- the caravan: armory and mosque ---------------- */

  // Between waves somebody waits in the arena: Ahmed, the Alchemist, or a buried cache.
  startCamp() {
    this.phase = 'camp';
    this.status = 'playing';
    this.shopOffers = [];
    this.shopTaken = false;
    this.healPlayer(Math.round(this.player.maxHp * 0.18));
    this.addGold(15 + this.wave * 3);
    this.projectiles = [];
    this.pickups = [];
    this.campNpc = null;
    this.treasure = null;
    this.nearCamp = false;
    const x = 220 + Math.random() * (ARENA.w - 560);
    const roll = Math.random();
    if (roll < 0.25) {
      this.treasure = { x, y: ARENA.groundY - 62, w: 88, h: 62, bob: 0, opened: false };
      this.banner = { text: 'A cache in the sand', sub: 'Something lies half-buried — walk over and press E', t: 3.2 };
    } else if (roll < 0.55) {
      this.campNpc = { kind: 'alchemist', name: 'the Alchemist', x, y: ARENA.groundY - 64, w: 62, h: 64, bob: 0 };
      this.alchStock = ALCHEMY.slice();
      this.alchBought = {};
      this.banner = { text: 'The Alchemist has set up', sub: 'Each vial does something different — press E', t: 3.2 };
    } else {
      this.campNpc = { kind: 'merchant', name: 'Ahmed', x, y: ARENA.groundY - 64, w: 62, h: 64, bob: 0 };
      this.banner = { text: 'Ahmed the merchant waves', sub: 'Press E to open his wares', t: 3.2 };
    }
  }

  updateCamp(dt) {
    const p = this.player;
    if (this.campNpc) this.campNpc.bob += dt;
    if (this.treasure) this.treasure.bob += dt;
    const target = this.campNpc || this.treasure;
    if (this.phase === 'camp' && target && !target.opened) {
      const dx = target.x + target.w / 2 - (p.x + p.w / 2);
      const dy = target.y + target.h / 2 - (p.y + p.h / 2);
      this.nearCamp = Math.hypot(dx, dy) < 170;
    } else {
      this.nearCamp = false;
    }
    if (this.pressed.talk && this.nearCamp) this.openCamp();
  }

  openCamp() {
    if (this.phase !== 'camp') return;
    if (this.campNpc) {
      this.status = 'shop';
      this.phase = 'shop';
      this.nearCamp = false;
      if (this.campNpc.kind === 'merchant' && !this.shopOffers.length) {
        this.shopOffers = pickSkillOffers(this.skills, 3);
      }
      this.banner =
        this.campNpc.kind === 'merchant'
          ? { text: 'Ahmed spreads his wares', sub: 'Trade your gold', t: 2.2 }
          : { text: 'The Alchemist uncorks a vial', sub: 'Every draught does something different', t: 2.2 };
    } else if (this.treasure) {
      this.openTreasure();
    }
  }

  openTreasure() {
    const t = this.treasure;
    if (!t || t.opened) return;
    t.opened = true;
    this.status = 'shop';
    this.phase = 'treasure';
    this.nearCamp = false;
    const purse = this.gold;
    this.addGold(60 + this.wave * 12);
    const loot = [{ label: `${this.gold - purse} gold`, icon: 'coins' }];
    const heal = Math.round(this.player.maxHp * 0.3);
    this.healPlayer(heal);
    loot.push({ label: `${heal} health restored`, icon: 'heart' });
    const options = ARMORY.filter((i) => !i.consumable && (this.up[i.id] || 0) < i.max);
    if (options.length) {
      const item = pick(options);
      this.up[item.id] = (this.up[item.id] || 0) + 1;
      if (item.id === 'plate') {
        this.player.maxHp += 20;
        this.healPlayer(20);
      }
      if (item.id === 'aegis') this.player.guard = Math.min(this.guardMax(), this.player.guard + 15);
      loot.push({ label: `${item.name}, free of charge`, icon: 'hammer' });
    } else {
      const purse2 = this.gold;
      this.addGold(40 + this.wave * 8);
      loot.push({ label: `${this.gold - purse2} more gold`, icon: 'coins' });
    }
    this.treasureLoot = loot;
    this.burst(t.x + t.w / 2, t.y + t.h / 2, '#ffd9a2', 44, 340);
    this.shake = 0.9;
    this.banner = { text: 'The cache is opened', sub: 'Spoils claimed', t: 2.2 };
  }

  // step back into the arena without starting the next wave
  closeShop() {
    if (this.status !== 'shop') return false;
    this.status = 'playing';
    this.phase = 'camp';
    this.nearCamp = false;
    return true;
  }

  nextWave() {
    if (this.phase !== 'shop' && this.phase !== 'treasure' && this.phase !== 'camp') return;
    this.status = 'playing';
    this.startWave(this.wave + 1);
  }

  buyPotion(id) {
    const potion = potionById(id);
    if (!potion || this.phase !== 'shop' || this.campNpc?.kind !== 'alchemist') return false;
    if (this.alchBought[id] || this.gold < potion.price) return false;
    this.gold -= potion.price;
    this.alchBought[id] = true;
    if (id === 'vigour') this.healPlayer(Math.round(this.player.maxHp * 0.6));
    if (id === 'wrath') this.buffs.wrath = BUFF_TIME;
    if (id === 'stride') this.buffs.stride = BUFF_TIME;
    if (id === 'ward') {
      this.buffs.ward = BUFF_TIME;
      this.player.guard = this.guardMax();
    }
    if (id === 'venom') this.buffs.venom = BUFF_TIME;
    if (id === 'angel') this.reviveReady = true;
    return true;
  }

  buyUpgrade(id) {
    const item = ARMORY.find((i) => i.id === id);
    if (!item || this.phase !== 'shop') return false;
    const level = this.up[id] || 0;
    if (level >= item.max) return false;
    const price = armoryPrice(item, level);
    if (this.gold < price) return false;
    this.gold -= price;
    this.up[id] = level + 1;
    if (item.consumable) {
      this.healPlayer(Math.round(this.player.maxHp * 0.45));
      return true;
    }
    if (id === 'plate') {
      this.player.maxHp += 20;
      this.healPlayer(20);
    }
    if (id === 'aegis') {
      this.player.guard = Math.min(this.guardMax(), this.player.guard + 15);
    }
    return true;
  }

  pickSkill(id, opts = {}) {
    if (this.skillSet.has(id) || !skillById(id)) return false;
    if (!opts.free && (this.phase !== 'shop' || this.shopTaken)) return false;
    this.skillSet.add(id);
    this.skills.push(id);
    if (!opts.free) this.shopTaken = true;
    if (id === 'vitality') {
      this.player.maxHp += 30;
      this.healPlayer(30);
    }
    if (id === 'companion') spawnCompanion(this);
    if (id === 'boat') spawnBoat(this);
    if (id === 'angel') this.reviveReady = true;
    return true;
  }

  getHud() {
    const p = this.player;
    return {
      hp: Math.max(0, Math.round(p.hp)),
      maxHp: Math.round(p.maxHp),
      wave: this.wave,
      maxWaves: MAX_WAVES,
      worldName: this.world.name,
      worldIndex: this.worldIndex,
      worldCount: WORLDS.length,
      status: this.status,
      phase: this.phase,
      score: this.score,
      gold: Math.round(this.gold),
      skills: this.skills.map((id) => ({ id, name: skillById(id)?.name || id })),
      buffs: this.buffs && Object.entries(this.buffs).filter(([, v]) => v > 0).map(([k]) => potionById(k)?.name || k),
      camp: this.campNpc || this.treasure
        ? {
            kind: this.campNpc ? this.campNpc.kind : 'treasure',
            name: this.campNpc ? this.campNpc.name : 'a buried cache',
            near: this.nearCamp,
          }
        : null,
      treasure: this.phase === 'treasure' ? { loot: this.treasureLoot } : null,
      shop: this.phase === 'shop'
        ? {
            armory: ARMORY.map((item) => {
              const level = this.up[item.id] || 0;
              const price = armoryPrice(item, level);
              return {
                id: item.id,
                name: item.name,
                tag: item.tag,
                desc: item.desc,
                level,
                max: Number.isFinite(item.max) ? item.max : null,
                price,
                owned: Number.isFinite(item.max) && level >= item.max,
                affordable: this.gold >= price,
                consumable: !!item.consumable,
              };
            }),
            skills: this.shopOffers.map((s) => ({ id: s.id, name: s.name, desc: s.desc, icon: s.icon, tier: s.tier })),
            potions: ALCHEMY.map((p) => ({
              id: p.id,
              name: p.name,
              desc: p.desc,
              icon: p.icon,
              price: p.price,
              bought: !!this.alchBought[p.id],
              affordable: this.gold >= p.price,
            })),
            taken: this.shopTaken,
          }
        : null,
      ability: {
        name: this.char.ability.name,
        cd: Math.max(0, p.abilityCd),
        max: this.char.ability.cd,
        ready: p.abilityCd <= 0,
      },
      guard: {
        name: this.char.shield.name,
        color: this.char.shield.color,
        value: Math.max(0, Math.round(p.guard)),
        max: this.guardMax(),
        raised: p.blocking,
        broken: p.guardBroken > 0,
      },
      boss: this.boss
        ? {
            name: this.boss.name,
            title: this.boss.title,
            phase: this.boss.phase,
            ratio: Math.max(0, this.boss.hp / this.boss.maxHp),
          }
        : null,
    };
  }
}
