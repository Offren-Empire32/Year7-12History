import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Users } from 'lucide-react';
import { Game as GameEngine } from '@/game/engine';
import { render } from '@/game/draw';
import { ARENA, CHARACTERS } from '@/game/config';
import Hud from './Hud';
import TouchControls from './TouchControls';
import RunOverlay from './RunOverlay';
import ShopStage from './ShopStage';
import TreasureStage from './TreasureStage';

const KEY_MAP = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowUp: 'jump',
  KeyW: 'jump',
  Space: 'jump',
  KeyJ: 'attack',
  KeyZ: 'attack',
  KeyK: 'ability',
  KeyX: 'ability',
  ShiftLeft: 'block',
  ShiftRight: 'block',
  KeyL: 'block',
  KeyE: 'talk',
  Enter: 'talk',
};

export default function GameStage({ characterId, worldIndex, carry, onProgress, onRestart, onExit, onNextWorld }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [hud, setHud] = useState(null);
  const [paused, setPaused] = useState(false);
  const character = CHARACTERS.find((c) => c.id === characterId) || CHARACTERS[0];

  useEffect(() => {
    const game = new GameEngine({ characterId, worldIndex, carry });
    gameRef.current = game;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let last = performance.now();
    let hudClock = 0;

    const loop = (now) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      game.update(dt);

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.setTransform(w / ARENA.w, 0, 0, h / ARENA.h, 0, 0);
      render(ctx, game);

      hudClock += dt;
      if (hudClock > 0.07) {
        hudClock = 0;
        setHud(game.getHud());
      }
      raf = requestAnimationFrame(loop);
    };

    setHud(game.getHud());
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      gameRef.current = null;
    };
  }, [characterId, worldIndex]);

  useEffect(() => {
    if (gameRef.current) gameRef.current.paused = paused;
  }, [paused]);

  useEffect(() => {
    const onDown = (e) => {
      if (e.code === 'Escape') {
        if (gameRef.current?.status === 'shop') {
          gameRef.current.closeShop();
          return;
        }
        setPaused((p) => !p);
        return;
      }
      const action = KEY_MAP[e.code];
      if (!action) return;
      e.preventDefault();
      if (e.repeat) return;
      gameRef.current?.press(action);
    };
    const onUp = (e) => {
      const action = KEY_MAP[e.code];
      if (action) gameRef.current?.release(action);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  const runOver = hud && (hud.status === 'dead' || hud.status === 'worldclear' || hud.status === 'victory');
  const inShop = hud?.status === 'shop';

  const continueRun = () => {
    const game = gameRef.current;
    if (!game) return;
    onProgress?.(game.getCarry());
    game.nextWave();
  };

  return (
    <div className="relative w-full">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[24px] border border-[#c9a227]/25 bg-black shadow-[0_40px_100px_-40px_rgba(0,0,0,0.95)]">
        <canvas ref={canvasRef} className="h-full w-full touch-none select-none" />

        {hud && (
          <Hud
            hud={hud}
            character={character}
            onPause={() => setPaused(true)}
            onNextWave={continueRun}
          />
        )}

        {!runOver && !inShop && (
          <TouchControls
            canTalk={!!hud?.camp?.near}
            onDown={(a) => gameRef.current?.press(a)}
            onUp={(a) => gameRef.current?.release(a)}
          />
        )}

        {paused && !runOver && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-[min(360px,90%)] rounded-3xl border border-[#c9a227]/30 bg-[#0d0912]/95 p-7 text-center">
              <h3 className="font-display text-xl text-[#f8e7bd]">Paused</h3>
              <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-[#8d7a63]">{hud?.worldName}</p>
              <div className="mt-6 space-y-2.5">
                <button
                  onClick={() => setPaused(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#f0d79a] to-[#c9a227] px-6 py-3 font-display text-[11px] uppercase tracking-[0.24em] text-[#1a1206]"
                >
                  <Play className="h-3.5 w-3.5" /> Resume
                </button>
                <button
                  onClick={onRestart}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 font-display text-[11px] uppercase tracking-[0.24em] text-[#e6cf9f] hover:border-[#c9a227]/50"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Restart world
                </button>
                <button
                  onClick={onExit}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 font-display text-[11px] uppercase tracking-[0.24em] text-[#e6cf9f] hover:border-[#c9a227]/50"
                >
                  <Users className="h-3.5 w-3.5" /> Change warrior
                </button>
              </div>
            </div>
          </div>
        )}

        {inShop && hud?.camp?.kind === 'treasure' && (
          <TreasureStage hud={hud} onContinue={continueRun} onClose={() => gameRef.current?.closeShop()} />
        )}

        {inShop && hud?.camp?.kind !== 'treasure' && (
          <ShopStage
            kind={hud?.camp?.kind}
            hud={hud}
            onBuy={(id) => gameRef.current?.buyUpgrade(id)}
            onPick={(id) => gameRef.current?.pickSkill(id)}
            onPotion={(id) => gameRef.current?.buyPotion(id)}
            onContinue={continueRun}
            onClose={() => gameRef.current?.closeShop()}
          />
        )}

        {hud && (
          <RunOverlay
            hud={hud}
            worldIndex={worldIndex}
            onRestart={onRestart}
            onExit={onExit}
            onNextWorld={() => {
              onProgress?.(gameRef.current?.getCarry());
              onNextWorld();
            }}
          />
        )}
      </div>
    </div>
  );
}
