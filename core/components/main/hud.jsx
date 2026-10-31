import React from 'react';
import { ChevronRight, Coins, Pause, Zap } from 'lucide-react';
import CountryballIcon from './CountryballIcon';

export default function Hud({ hud, character, onPause, onNextWave }) {
  const hpRatio = Math.max(0, Math.min(1, hud.hp / hud.maxHp));
  const bossFight = hud.phase === 'boss' || hud.phase === 'bossintro';
  const waveLabel = bossFight ? 'Champion' : `Wave ${Math.max(1, hud.wave)} / ${hud.maxWaves}`;
  const cdRatio = hud.ability.max ? Math.min(1, hud.ability.cd / hud.ability.max) : 0;
  const guardRatio = Math.max(0, Math.min(1, hud.guard.value / hud.guard.max));

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        {/* health */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-black/45 px-2.5 py-2 backdrop-blur-md sm:gap-3 sm:px-3">
          <CountryballIcon flag={character.flag} size={34} />
          <div className="w-24 sm:w-40">
            <div className="flex items-baseline justify-between text-[9px] uppercase tracking-[0.14em] text-[#e8d3a8]">
              <span className="truncate pr-1">{character.nation}</span>
              <span className="text-[#c9a227]">
                {hud.hp}/{hud.maxHp}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#e04f3f] to-[#ffb27a] transition-[width] duration-150"
                style={{ width: `${hpRatio * 100}%` }}
              />
            </div>
            <div className="mt-1 flex items-baseline justify-between text-[8px] uppercase tracking-[0.14em] text-[#a4917a]">
              <span className="truncate pr-1">{hud.guard.name}</span>
              <span style={{ color: hud.guard.broken ? '#ff8f7a' : hud.guard.color }}>
                {hud.guard.broken ? 'broken' : guardRatio > 0 ? 'Shift' : 'spent'}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full transition-[width] duration-150"
                style={{
                  width: `${guardRatio * 100}%`,
                  background: hud.guard.broken ? '#ff6b5a' : hud.guard.color,
                }}
              />
            </div>
          </div>
        </div>

        {/* wave */}
        <div className="mt-1 text-center">
          <div className="rounded-full border border-[#c9a227]/40 bg-black/45 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-[#f7e3b6] backdrop-blur-md sm:px-4 sm:text-[11px]">
            {waveLabel}
          </div>
          <div className="mt-1.5 hidden text-[9px] uppercase tracking-[0.24em] text-[#c9a227]/70 sm:block">
            World {hud.worldIndex + 1} / {hud.worldCount} · {hud.worldName}
          </div>
          <div className="mt-1 flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-[0.18em] text-[#e6cf9f]">
            <Coins className="h-3 w-3 text-[#c9a227]" /> {hud.gold}
            {hud.skills?.length ? <span className="text-[#8d7a63]">· {hud.skills.length} blessings</span> : null}
          </div>
          {hud.buffs?.length ? (
            <div className="mt-1 flex flex-wrap items-center justify-center gap-1">
              {hud.buffs.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-[#7ddca0]/30 bg-[#7ddca0]/10 px-2 py-0.5 text-[8px] uppercase tracking-[0.14em] text-[#bff3d4]"
                >
                  {b}
                </span>
              ))}
            </div>
          ) : null}
          {hud.phase === 'camp' && (
            <button
              onClick={onNextWave}
              className="pointer-events-auto mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#c9a227]/50 bg-black/60 px-4 py-2 font-display text-[10px] uppercase tracking-[0.22em] text-[#f8e7bd] backdrop-blur-md transition-colors hover:border-[#c9a227] hover:text-white"
            >
              Next wave <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* ability + pause */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div
            className={`relative flex items-center gap-2 overflow-hidden rounded-2xl border px-2.5 py-2 backdrop-blur-md sm:px-3 ${
              hud.ability.ready ? 'border-[#9fe0ff]/50 bg-[#0d2b3a]/60' : 'border-white/10 bg-black/45'
            }`}
          >
            <Zap className={`h-4 w-4 ${hud.ability.ready ? 'text-[#9fe0ff]' : 'text-[#6b7280]'}`} />
            <div>
              <div className="text-[9px] uppercase tracking-[0.16em] text-[#dbe7ee]">{hud.ability.name}</div>
              <div className="text-[9px] uppercase tracking-[0.16em] text-[#7d8f9c]">
                {hud.ability.ready ? 'K · ready' : `K · ${hud.ability.cd.toFixed(1)}s`}
              </div>
            </div>
            <div
              className="absolute bottom-0 left-0 h-[2px] bg-[#9fe0ff]/70"
              style={{ width: `${(1 - cdRatio) * 100}%` }}
            />
          </div>
          <button
            onClick={onPause}
            aria-label="Pause"
            className="rounded-2xl border border-white/15 bg-black/45 p-2.5 text-[#e8d3a8] backdrop-blur-md transition-colors hover:border-[#c9a227]/50 hover:text-[#f8e7bd]"
          >
            <Pause className="h-4 w-4" />
          </button>
        </div>
      </div>

      {hud.boss && (
        <div className="mx-auto w-[min(660px,92%)] pb-1">
          <div className="text-center">
            <div className="font-display text-[11px] uppercase tracking-[0.28em] text-[#ffd9a2]">{hud.boss.name}</div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-[#a4917a]">
              {hud.boss.title}
              {hud.boss.phase >= 2 ? (
                <span className="ml-1.5 text-[#ff9a6c]">· Phase {hud.boss.phase === 3 ? 'III' : 'II'}</span>
              ) : null}
            </div>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full border border-[#c9a227]/40 bg-black/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8f2f22] via-[#e0563f] to-[#ffb27a] transition-[width] duration-150"
              style={{ width: `${hud.boss.ratio * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
