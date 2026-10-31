import React from 'react';
import { motion } from 'framer-motion';
import CountryballIcon from './CountryballIcon';
import { CHARACTERS } from '@/game/config';

const CONTROLS = [
  { keys: 'A / D', label: 'Move' },
  { keys: 'W / Space', label: 'Jump · double jump' },
  { keys: 'S / ↓', label: 'Drop through a platform' },
  { keys: 'J', label: 'Attack' },
  { keys: 'K', label: 'Ability' },
  { keys: 'Shift / L', label: 'Raise shield · hold' },
];

export default function TitleScreen({ onStart }) {
  return (
    <div className="pattern-bg relative min-h-screen w-full overflow-hidden bg-[#0a0710] text-[#f4e4c1]">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#c9a227]/20 blur-[120px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[10px] uppercase tracking-[0.55em] text-[#c9a227]"
        >
          A countryball survival saga
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.06 }}
          className="mt-7 font-display text-[13vw] leading-[0.92] tracking-tight text-[#f8e7bd] sm:text-7xl"
        >
          SANDS OF
          <br />
          THE CRESCENT
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-7 max-w-lg text-sm leading-relaxed text-[#c2ad91] sm:text-base"
        >
          Four nation-balls hold a desert arena against an endless host. Survive five worlds of
          twenty waves each, and break the champion who guards every gate.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10"
        >
          <button
            onClick={onStart}
            className="group relative rounded-full bg-gradient-to-b from-[#f0d79a] to-[#c9a227] px-10 py-4 font-display text-sm uppercase tracking-[0.28em] text-[#1a1206] shadow-[0_20px_50px_-18px_rgba(201,162,39,0.9)] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.99]"
          >
            Enter the arena
          </button>
        </motion.div>

        <div className="mt-16 flex flex-wrap items-end justify-center gap-8">
          {CHARACTERS.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.08 }}
              className="flex flex-col items-center gap-2"
            >
              <CountryballIcon flag={c.flag} size={62} />
              <span className="text-[9px] uppercase tracking-[0.22em] text-[#8d7a63]">{c.nation}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 grid w-full grid-cols-2 gap-x-6 gap-y-3 border-t border-[#c9a227]/15 pt-8 text-left sm:grid-cols-4">
          {CONTROLS.map((c) => (
            <div key={c.label}>
              <div className="font-display text-[11px] tracking-[0.16em] text-[#e6cf9f]">{c.keys}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#7d6c59]">{c.label}</div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-[#5f5245]">
          On a phone, use the on-screen buttons
        </p>
      </div>
    </div>
  );
}
