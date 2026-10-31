import React from 'react';
import { ArrowRight, Coins, Heart, Hammer, Sparkles, X } from 'lucide-react';

const ICONS = { coins: Coins, heart: Heart, hammer: Hammer };

export default function TreasureStage({ hud, onContinue, onClose }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#08060c]/95 p-4 backdrop-blur-md">
      <div className="w-[min(460px,94%)] rounded-3xl border border-[#c9a227]/30 bg-black/40 p-5 text-center sm:p-6">
        <Sparkles className="mx-auto h-6 w-6 text-[#f0d79a]" />
        <h3 className="mt-3 font-display text-xl text-[#f8e7bd]">The cache is opened</h3>
        <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#8d7a63]">Wave {hud.wave} cleared</p>

        <ul className="mt-5 space-y-2 text-left">
          {(hud.treasure?.loot || []).map((line) => {
            const Icon = ICONS[line.icon] || Sparkles;
            return (
              <li
                key={line.label}
                className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-[#f0d79a]"
              >
                <Icon className="h-4 w-4 shrink-0 text-[#c9a227]" /> {line.label}
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#8d7a63]">
          <Coins className="h-3 w-3 text-[#c9a227]" /> {hud.gold} gold in your purse
        </div>

        <div className="mt-5 space-y-2">
          <button
            onClick={onContinue}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#f0d79a] to-[#c9a227] px-6 py-3 font-display text-[11px] uppercase tracking-[0.24em] text-[#1a1206] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
          >
            To wave {hud.wave + 1} <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 font-display text-[11px] uppercase tracking-[0.24em] text-[#e6cf9f] transition-colors hover:border-[#c9a227]/60"
          >
            <X className="h-3.5 w-3.5" /> Back to the arena
          </button>
        </div>
      </div>
    </div>
  );
}
