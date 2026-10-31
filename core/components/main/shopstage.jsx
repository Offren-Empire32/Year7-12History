import React from 'react';
import { ArrowRight, Coins, FlaskConical, Tent, X } from 'lucide-react';
import ArmoryPanel from './ArmoryPanel';
import MosquePanel from './MosquePanel';
import AlchemistPanel from './AlchemistPanel';

export default function ShopStage({ kind, hud, onBuy, onPick, onPotion, onContinue, onClose }) {
  const shop = hud?.shop;
  if (!shop) return null;
  const alchemist = kind === 'alchemist';

  return (
    <div className="absolute inset-0 z-30 flex flex-col gap-2 overflow-y-auto bg-[#08060c]/95 p-3 backdrop-blur-md sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 font-display text-base leading-tight text-[#f8e7bd] sm:text-xl">
            {alchemist ? (
              <FlaskConical className="h-4 w-4 text-[#7ddca0]" />
            ) : (
              <Tent className="h-4 w-4 text-[#c9a227]" />
            )}
            {alchemist ? 'The Alchemist opens his case' : 'Ahmed spreads his wares'}
          </h3>
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#8d7a63]">
            {alchemist
              ? 'Every draught does something different'
              : `Wave ${hud.wave} cleared · trade, take a blessing, then march on`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-[#c9a227]/40 bg-black/50 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-[#f7e3b6]">
          <Coins className="h-3.5 w-3.5 text-[#c9a227]" /> {hud.gold} gold
        </div>
      </div>

      {alchemist ? (
        <AlchemistPanel items={shop.potions || []} onBuy={onPotion} />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <ArmoryPanel items={shop.armory} onBuy={onBuy} />
          <MosquePanel offers={shop.skills} taken={shop.taken} onPick={onPick} />
        </div>
      )}

      <div className="mt-auto flex flex-col items-center gap-2 pt-1 sm:flex-row sm:justify-between">
        <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
          {hud.skills.length === 0 ? (
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#5f5245]">No blessings yet</span>
          ) : (
            hud.skills.map((s) => (
              <span
                key={s.id}
                className="rounded-full border border-[#c9a227]/25 bg-[#c9a227]/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-[#e6cf9f]"
              >
                {s.name}
              </span>
            ))
          )}
          {hud.buffs.map((b) => (
            <span
              key={b}
              className="rounded-full border border-[#7ddca0]/30 bg-[#7ddca0]/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-[#bff3d4]"
            >
              {b}
            </span>
          ))}
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <button
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 font-display text-[11px] uppercase tracking-[0.24em] text-[#e6cf9f] transition-colors hover:border-[#c9a227]/60 sm:w-auto"
          >
            <X className="h-3.5 w-3.5" /> Back to the arena
          </button>
          <button
            onClick={onContinue}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#f0d79a] to-[#c9a227] px-7 py-3 font-display text-[11px] uppercase tracking-[0.24em] text-[#1a1206] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99] sm:w-auto"
          >
            To wave {hud.wave + 1} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
