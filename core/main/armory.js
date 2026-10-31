/* Stock of the armory. Weapons, armour and a few relics, paid for with gold. */

export const ARMORY = [
  { id: 'whetstone', name: 'Whetstone', tag: 'Weapon', max: 5, base: 40, step: 25, desc: '+12% damage a level' },
  { id: 'plate', name: 'Plated Mail', tag: 'Armour', max: 5, base: 45, step: 30, desc: '+20 health and 4% less damage taken a level' },
  { id: 'aegis', name: 'Reinforced Rim', tag: 'Armour', max: 4, base: 50, step: 35, desc: '+15 guard and faster guard recovery a level' },
  { id: 'gauntlets', name: 'Steel Gauntlets', tag: 'Weapon', max: 4, base: 45, step: 25, desc: '10% faster attacks a level' },
  { id: 'greaves', name: 'Swift Greaves', tag: 'Armour', max: 4, base: 35, step: 20, desc: '+8% movement speed a level' },
  { id: 'reliquary', name: 'Reliquary', tag: 'Relic', max: 4, base: 55, step: 30, desc: '12% faster ability a level' },
  { id: 'banner', name: "Warlord's Banner", tag: 'Relic', max: 3, base: 40, step: 25, desc: '+20% gold a level' },
  { id: 'salve', name: 'Field Salve', tag: 'Kit', max: Infinity, base: 30, step: 15, consumable: true, desc: 'Heal 45% of your health right now' },
];

export function armoryPrice(item, level) {
  return item.base + item.step * level;
}
