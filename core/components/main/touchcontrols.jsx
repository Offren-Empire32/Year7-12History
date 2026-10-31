import React from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ArrowUp, Sword, Zap, Shield, MessageCircle } from 'lucide-react';

function PadButton({ label, icon: Icon, onDown, onUp, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-white/20 bg-black/45 text-[#e8d3a8]',
    attack: 'border-[#c9a227]/50 bg-[#3a2a12]/70 text-[#f8e7bd]',
    ability: 'border-[#9fe0ff]/50 bg-[#0d2b3a]/70 text-[#cfe6f5]',
    guard: 'border-[#c9a227]/50 bg-[#2a1f10]/70 text-[#f0d79a]',
  };
  return (
    <button
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        onDown();
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        onUp();
      }}
      onPointerLeave={onUp}
      onPointerCancel={onUp}
      className={`flex h-14 w-14 touch-none select-none items-center justify-center rounded-full border backdrop-blur-md active:scale-95 ${tones[tone]}`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

export default function TouchControls({ canTalk, onDown, onUp }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between px-3 pb-3 lg:hidden">
      <div className="pointer-events-auto flex gap-2">
        <PadButton label="Move left" icon={ChevronLeft} onDown={() => onDown('left')} onUp={() => onUp('left')} />
        <PadButton label="Move right" icon={ChevronRight} onDown={() => onDown('right')} onUp={() => onUp('right')} />
        <PadButton label="Drop down" icon={ChevronDown} onDown={() => onDown('down')} onUp={() => onUp('down')} />
      </div>
      <div className="pointer-events-auto flex items-end gap-2">
        {canTalk && (
          <PadButton label="Talk" icon={MessageCircle} tone="guard" onDown={() => onDown('talk')} onUp={() => onUp('talk')} />
        )}
        <PadButton label="Block" icon={Shield} tone="guard" onDown={() => onDown('block')} onUp={() => onUp('block')} />
        <PadButton label="Ability" icon={Zap} tone="ability" onDown={() => onDown('ability')} onUp={() => onUp('ability')} />
        <PadButton label="Attack" icon={Sword} tone="attack" onDown={() => onDown('attack')} onUp={() => onUp('attack')} />
        <PadButton label="Jump" icon={ArrowUp} onDown={() => onDown('jump')} onUp={() => onUp('jump')} />
      </div>
    </div>
  );
}
