/* Teachings bought at the mosque. Every one of them lasts for the rest of the run. */

export const SKILLS = [
  { id: 'poison', name: 'Poison Tips', icon: 'flask', tier: 'bronze', desc: 'Your blows leave venom — a struck enemy bleeds for 2.5 seconds.' },
  { id: 'burn', name: 'Greek Legacy', icon: 'flame', tier: 'silver', desc: 'Struck enemies catch fire and burn for 2 seconds.' },
  { id: 'zeus', name: 'Wrath of Heaven', icon: 'bolt', tier: 'gold', desc: 'One blow in seven calls a lightning bolt down on the enemy.' },
  { id: 'crit', name: "Headsman's Eye", icon: 'spark', tier: 'gold', desc: 'One blow in five lands for double damage.' },
  { id: 'lifesteal', name: 'Bloodthirst', icon: 'drop', tier: 'silver', desc: 'A quarter of your hits drink 2 health back.' },
  { id: 'regen', name: 'Blessed Waters', icon: 'pulse', tier: 'silver', desc: 'Regenerate 1 health every second, all run long.' },
  { id: 'vitality', name: 'Iron Heart', icon: 'heart', tier: 'bronze', desc: '+30 maximum health, healed the moment you take it.' },
  { id: 'companion', name: 'Faithful Companion', icon: 'ally', tier: 'gold', desc: 'A friendly ball follows you, pelts your foes and tosses you bread.' },
  { id: 'boat', name: 'The Boat', icon: 'boat', tier: 'bronze', desc: 'A boat. It does nothing. It is a very fine boat.' },
  { id: 'thorns', name: 'Bramble Mail', icon: 'thorn', tier: 'silver', desc: 'Whoever strikes you takes 7 damage for their trouble.' },
  { id: 'reflect', name: 'Mirror Ward', icon: 'mirror', tier: 'gold', desc: 'One blow in nine is turned aside, and its bearer is hurt instead.' },
  { id: 'explode', name: 'Funeral Pyre', icon: 'bomb', tier: 'silver', desc: 'Slain enemies burst, wounding everyone close by.' },
  { id: 'bread', name: "Baker's Blessing", icon: 'bread', tier: 'bronze', desc: 'Fallen enemies sometimes drop bread that restores 15 health.' },
  { id: 'aura', name: 'Sandstorm Aura', icon: 'wind', tier: 'silver', desc: 'A whirling storm grinds any enemy that comes near you.' },
  { id: 'meteor', name: 'Falling Stars', icon: 'star', tier: 'gold', desc: 'Every eight seconds a star falls on a foe.' },
  { id: 'twinshot', name: 'Twin Volley', icon: 'twin', tier: 'silver', desc: 'Every shot looses a second missile beside the first.' },
  { id: 'pierce', name: 'Penetrating Bolts', icon: 'pierce', tier: 'silver', desc: 'Your shots pass through up to two enemies.' },
  { id: 'frenzy', name: 'Frenzy', icon: 'frenzy', tier: 'silver', desc: 'You swing and fire 15% faster.' },
  { id: 'fleet', name: 'Light Feet', icon: 'fleet', tier: 'bronze', desc: 'Move 12% faster.' },
  { id: 'triplejump', name: 'Skyward', icon: 'jump', tier: 'silver', desc: 'A third jump, taken in mid-air.' },
  { id: 'greed', name: 'Midas Touch', icon: 'greed', tier: 'bronze', desc: 'Gather 40% more gold from the fallen.' },
  { id: 'zeal', name: 'Zeal', icon: 'zeal', tier: 'silver', desc: 'Your ability returns 25% sooner.' },
  { id: 'bulwark', name: 'Eternal Bulwark', icon: 'bulwark', tier: 'silver', desc: 'Your guard recovers half again as fast and rises again sooner when broken.' },
  { id: 'angel', name: 'Guardian Angel', icon: 'angel', tier: 'gold', desc: 'Once each world, a killing blow leaves you standing at half health.' },
];

export function skillById(id) {
  return SKILLS.find((s) => s.id === id) || null;
}

// Three teachings you do not already know, in random order.
export function pickSkillOffers(owned = [], count = 3) {
  const taken = new Set(owned);
  const pool = SKILLS.filter((s) => !taken.has(s.id));
  const offers = [];
  while (offers.length < count && pool.length) {
    offers.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return offers;
}
