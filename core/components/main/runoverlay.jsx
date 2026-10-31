import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WORLDS } from '@/game/config';

function Panel({ title, sub, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.28 }}
      className="pointer-events-auto w-[min(420px,88%)] rounded-3xl border border-[#c9a227]/30 bg-[#0d0912]/92 p-7 text-center backdrop-blur-xl"
    >
      <h3 className="font-display text-2xl text-[#f8e7bd]">{title}</h3>
      <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[#8d7a63]">{sub}</p>
      <div className="mt-6 space-y-2.5">{children}</div>
    </motion.div>
  );
}

function Action({ onClick, children, primary }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-full px-6 py-3.5 font-display text-[11px] uppercase tracking-[0.24em] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99] ${
        primary
          ? 'bg-gradient-to-b from-[#f0d79a] to-[#c9a227] text-[#1a1206]'
          : 'border border-white/15 text-[#e6cf9f] hover:border-[#c9a227]/50'
      }`}
    >
      {children}
    </button>
  );
}

export default function RunOverlay({ hud, worldIndex, onRestart, onExit, onNextWorld }) {
  const status = hud?.status;
  const visible = status === 'dead' || status === 'worldclear' || status === 'victory';
  const nextWorld = WORLDS[worldIndex + 1];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/65 backdrop-blur-sm"
        >
          {status === 'dead' && (
            <Panel title="You fell" sub={`${hud.worldName} · wave ${Math.max(1, hud.wave)} of ${hud.maxWaves}`}>
              <Action primary onClick={onRestart}>
                Fight again
              </Action>
              <Action onClick={onExit}>Choose another warrior</Action>
            </Panel>
          )}

          {status === 'worldclear' && (
            <Panel title="World cleared" sub={`${hud.worldName} · champion fallen`}>
              <p className="mb-2 text-sm text-[#b6a389]">
                {nextWorld ? `${nextWorld.name} waits beyond the gate. The host there is stronger.` : 'The last gate stands open.'}
              </p>
              <Action primary onClick={onNextWorld}>
                Enter {nextWorld ? nextWorld.name : 'the next world'}
              </Action>
              <Action onClick={onExit}>Choose another warrior</Action>
            </Panel>
          )}

          {status === 'victory' && (
            <Panel title="The sands are yours" sub={`${hud.score} points · every world survived`}>
              <p className="mb-2 text-sm text-[#b6a389]">
                All five champions have fallen. The arena is quiet at last.
              </p>
              <Action primary onClick={onRestart}>
                March again
              </Action>
              <Action onClick={onExit}>Choose another warrior</Action>
            </Panel>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
