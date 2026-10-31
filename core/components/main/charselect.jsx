import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Sword, Sparkles, Shield, Wind } from 'lucide-react';
import CountryballIcon from './CountryballIcon';
import { CHARACTERS, WORLDS } from '@/game/config';

const WEAPON_LABEL = {
  greatsword: 'Imperial greatsword · wide slash',
  lance: 'Winged lance · pierces a crowd',
  crossbow: 'Crossbow · fast bolts',
  greekfire: 'Greek fire siphon · homing flame',
};

const ABILITY_ICON = { whirl: Wind, bulwark: Shield, volley: Sword, nova: Sparkles };

function StatBar({ label, value, max, tint }) {
  return (
    <div>
      <div className="flex justify-between text-[9px] uppercase tracking-[0.18em] text-[#8d7a63]">
        <span>{label}</span>
        <span className="text-[#c9a227]">{Math.round((value / max) * 100)}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: tint }} />
      </div>
    </div>
  );
}

export default function CharacterSelect({ onBack, onConfirm }) {
  const [selected, setSelected] = useState(CHARACTERS[0].id);
  const chosen = CHARACTERS.find((c) => c.id === selected) || CHARACTERS[0];
  const AbilityIcon = ABILITY_ICON[chosen.ability.kind] || Sparkles;

  return (
    <div className="pattern-bg min-h-screen w-full bg-[#0a0710] px-5 py-10 text-[#f4e4c1] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[#8d7a63] transition-colors hover:text-[#e6cf9f]"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8d7a63]">
            {WORLDS.length} worlds · {WORLDS.length * 20} waves
          </span>
        </div>

        <h2 className="mt-6 font-display text-3xl leading-tight text-[#f8e7bd] sm:text-4xl">Choose your warrior</h2>
        <p className="mt-2 text-sm text-[#a4917a]">Every nation-ball fights differently. Pick the one that suits your hands.</p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CHARACTERS.map((c) => {
            const active = c.id === selected;
            return (
              <motion.button
                key={c.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(c.id)}
                className={`relative flex flex-col items-center gap-3 rounded-2xl border px-3 py-6 transition-all duration-300 ${
                  active
                    ? 'border-[#c9a227]/70 bg-[#c9a227]/10 shadow-[0_18px_50px_-24px_rgba(201,162,39,0.8)]'
                    : 'border-white/10 bg-white/[0.03] hover:border-[#c9a227]/30'
                }`}
              >
                <CountryballIcon flag={c.flag} size={72} />
                <div className="text-center">
                  <div className="font-display text-[12px] tracking-[0.12em] text-[#f2dcaa]">{c.nation}</div>
                  <div className="mt-1 text-[9px] uppercase tracking-[0.16em] text-[#8d7a63]">{c.role}</div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-[1.1fr_1fr] sm:p-7">
          <div>
            <h3 className="font-display text-xl text-[#f8e7bd]">{chosen.nation}</h3>
            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[#c9a227]">{chosen.role}</p>
            <p className="mt-4 text-sm leading-relaxed text-[#b6a389]">{chosen.blurb}</p>
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#c9a227]/20 bg-black/30 p-4">
              <Sword className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a227]" />
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-[#e6cf9f]">{WEAPON_LABEL[chosen.weapon.kind]}</div>
                <div className="mt-1 text-[11px] text-[#8d7a63]">{Math.round(chosen.weapon.dmg)} damage per hit</div>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-[#7fb3d5]/25 bg-black/30 p-4">
              <AbilityIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#9fe0ff]" />
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-[#cfe6f5]">
                  {chosen.ability.name} <span className="text-[#7d8f9c]">· K · {chosen.ability.cd}s</span>
                </div>
                <div className="mt-1 text-[11px] leading-relaxed text-[#8d7a63]">{chosen.ability.desc}</div>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-[#c9a227]/25 bg-black/30 p-4">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#e8c25c]" />
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-[#f0d79a]">
                  {chosen.shield.name} <span className="text-[#8d7a63]">· hold Shift / L</span>
                </div>
                <div className="mt-1 text-[11px] leading-relaxed text-[#8d7a63]">{chosen.shield.desc}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <StatBar label="Vitality" value={chosen.hp} max={170} tint="linear-gradient(90deg,#e04f3f,#ffb27a)" />
              <StatBar label="Power" value={chosen.weapon.dmg} max={20} tint="linear-gradient(90deg,#c9a227,#f8e7bd)" />
              <StatBar label="Speed" value={chosen.speed} max={430} tint="linear-gradient(90deg,#3f9d7a,#9fe0c0)" />
            </div>
            <button
              onClick={() => onConfirm(chosen.id)}
              className="mt-2 w-full rounded-full bg-gradient-to-b from-[#f0d79a] to-[#c9a227] px-6 py-4 font-display text-[11px] uppercase tracking-[0.28em] text-[#1a1206] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.99]"
            >
              Into {WORLDS[0].name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
