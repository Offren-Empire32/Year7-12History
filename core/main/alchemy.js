/* What the Alchemist sells. Every vial does something different, and each one
   can be bought once per visit. */

export const BUFF_TIME = 60;

export const ALCHEMY = [
  { id: 'vigour', name: 'Flask of Vigour', icon: 'heart', price: 40, desc: 'Drink deep — 60% of your health returns at once.' },
  { id: 'wrath', name: 'Oil of Wrath', icon: 'flame', price: 55, desc: 'Your blows bite 60% harder for the next wave.' },
  { id: 'stride', name: 'Sandstrider Draught', icon: 'wind', price: 45, desc: 'Move 30% faster and strike quicker for the next wave.' },
  { id: 'ward', name: 'Ward of Glass', icon: 'shield', price: 50, desc: 'Your guard is refilled and half again as deep for the next wave.' },
  { id: 'venom', name: "Viper's Kiss", icon: 'flask', price: 60, desc: 'Coat your weapon — your blows poison enemies for the next wave.' },
  { id: 'angel', name: 'Second Wind', icon: 'crown', price: 70, desc: 'One draught that stands you up again after a killing blow.' },
];

export function potionById(id) {
  return ALCHEMY.find((p) => p.id === id) || null;
}
