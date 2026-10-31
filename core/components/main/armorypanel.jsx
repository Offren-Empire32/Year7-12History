import React from 'react';
import { Hammer } from 'lucide-react';

const TAGS = {
  Weapon: 'text-[#f0d79a]',
  Armour: 'text-[#cfe6f5]',
  Relic: 'text-[#d9c2ff]',
  Kit: 'text-[#ffb27a]',
};

export default function ArmoryPanel({ items, onBuy }) {
  return (
    <section className="rounded-2xl border border-[#c9a227]/25 bg-black/35 p-3">
      <header className="flex items-center gap-2">
        <Hammer className="h-4 w-4 text-[#c9a227]" />
        <h4 className="font-display text-sm text-[#f8e7bd]">The Armory</h4>
        <span className="ml-auto text-[9px] uppercase tracking-[0.16em] text-[#8d7a63]">Weapons &amp; armour</span>
      </header>

      <div className="mt-2 space-y-1.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-1.5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="truncate text-[11px] uppercase tracking-[0.12em] text-[#f0d79a]">{item.name}</span>
                <span className={`text-[8px] uppercase tracking-[0.16em] ${TAGS[item.tag] || 'text-[#8d7a63]'}`}>
                  {item.tag}
                </span>
                {!item.consumable && (
                  <span className="ml-auto shrink-0 text-[8px] uppercase tracking-[0.16em] text-[#8d7a63]">
                    Lv {item.level}/{item.max}
                  </span>
                )}
              </div>
              <p className="truncate text-[10px] leading-snug text-[#a4917a]">{item.desc}</p>
            </div>
            <button
              onClick={() => onBuy(item.id)}
              disabled={item.owned || !item.affordable}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] transition-colors ${
                item.owned
                  ? 'border-white/10 text-[#5f5245]'
                  : item.affordable
                    ? 'border-[#c9a227]/50 text-[#f7e3b6] hover:bg-[#c9a227]/15'
                    : 'border-white/10 text-[#5f5245]'
              }`}
            >
              {item.owned ? 'Full' : `${item.price}g`}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
