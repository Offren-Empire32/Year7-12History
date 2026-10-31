import React, { useState } from 'react';
import TitleScreen from '@/components/game/TitleScreen';
import CharacterSelect from '@/components/game/CharacterSelect';
import GameStage from '@/components/game/GameStage';
import { CHARACTERS, WORLDS } from '@/game/config';

export default function Game() {
  const [screen, setScreen] = useState('title');
  const [characterId, setCharacterId] = useState(CHARACTERS[0].id);
  const [worldIndex, setWorldIndex] = useState(0);
  const [runKey, setRunKey] = useState(0);
  const [carry, setCarry] = useState(null);

  const beginRun = (id) => {
    setCharacterId(id);
    setWorldIndex(0);
    setCarry(null);
    setRunKey((k) => k + 1);
    setScreen('play');
  };

  const restart = () => setRunKey((k) => k + 1);

  const nextWorld = () => {
    setWorldIndex((i) => Math.min(WORLDS.length - 1, i + 1));
    setRunKey((k) => k + 1);
  };

  if (screen === 'title') {
    return <TitleScreen onStart={() => setScreen('select')} />;
  }

  if (screen === 'select') {
    return <CharacterSelect onBack={() => setScreen('title')} onConfirm={beginRun} />;
  }

  return (
    <div className="pattern-bg min-h-screen w-full bg-[#08060c] px-3 py-5 text-[#f4e4c1] sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1180px] flex-col justify-center">
        <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[#7d6c59]">
          <button onClick={() => setScreen('select')} className="transition-colors hover:text-[#e6cf9f]">
            Warriors
          </button>
          <span className="text-[#c9a227]/80">{WORLDS[worldIndex].name}</span>
        </div>

        <GameStage
          key={runKey}
          characterId={characterId}
          worldIndex={worldIndex}
          carry={carry}
          onProgress={setCarry}
          onRestart={restart}
          onExit={() => setScreen('select')}
          onNextWorld={nextWorld}
        />

        <p className="mt-4 text-center text-[10px] uppercase tracking-[0.18em] text-[#5f5245]">
          A / D move · W or Space jump · S or ↓ drop · J attack · K ability · Shift block · E talk · Esc pause
        </p>
      </div>
    </div>
  );
}
