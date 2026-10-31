import React from 'react';
import { FlaskConical, Flame, Wind, Shield, Heart, Crown } from 'lucide-react';

const ICONS = { flask: FlaskConical, flame: Flame, wind: Wind, shield: Shield, heart: Heart, crown: Crown };

export default function AlchemistPanel({ items, onBuy }) {
  return (
    <section className="rounded-2xl border border-[#7ddca0]/25 bg-black/35 p-3">
      <header className="flex items-center gap-2">
        <FlaskConical className="h-4 w-4 text-[#7ddca0]" />
        <h4 className="font-display text-sm text-[#e6f7ee]">The Alchemist's Case</h4>
        <span className="ml-auto text-[9px] uppercase tracking-[0.16em] text-[#8d7a63]">One of each per visit</span>
      </header>

      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = ICONS[item.icon] || FlaskConical;
          return (
            <div
              key={item.id}
              className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#7ddca0]" />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#e6f7ee]">{item.name}</div>
                <p className="text-[10px] leading-snug text-[#a4917a]">{item.desc}</p>
              </div>
              <button
                onClick={() => onBuy(item.id)}
                disabled={item.bought || !item.affordable}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] transition-colors ${
                  item.bought
                    ? 'border-[#7ddca0]/30 text-[#7ddca0]'
                    : item.affordable
                      ? 'border-[#7ddca0]/45 text-[#e6f7ee] hover:bg-[#7ddca0]/15'
                      : 'border-white/10 text-[#5f5245]'
                }`}
              >
                {item.bought ? 'Drunk' : `${item.price}g`}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
