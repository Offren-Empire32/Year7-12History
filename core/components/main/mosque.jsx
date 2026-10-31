import React from 'react';
import {
  FlaskConical,
  Flame,
  Zap,
  Sparkles,
  Droplets,
  HeartPulse,
  Heart,
  Users,
  Sailboat,
  ShieldAlert,
  Shield,
  Bomb,
  Wheat,
  Wind,
  Star,
  Waves,
  Crosshair,
  Gauge,
  Feather,
  ChevronsUp,
  Coins,
  Hourglass,
  Crown,
  MoonStar,
} from 'lucide-react';

const ICONS = {
  flask: FlaskConical,
  flame: Flame,
  bolt: Zap,
  spark: Sparkles,
  drop: Droplets,
  pulse: HeartPulse,
  heart: Heart,
  ally: Users,
  boat: Sailboat,
  thorn: ShieldAlert,
  mirror: Shield,
  bomb: Bomb,
  bread: Wheat,
  wind: Wind,
  star: Star,
  twin: Waves,
  pierce: Crosshair,
  frenzy: Gauge,
  fleet: Feather,
  jump: ChevronsUp,
  greed: Coins,
  zeal: Hourglass,
  bulwark: Shield,
  angel: Crown,
};

const TIERS = {
  bronze: 'border-[#c98a4a]/30 bg-[#c98a4a]/[0.07]',
  silver: 'border-white/20 bg-white/[0.05]',
  gold: 'border-[#c9a227]/45 bg-[#c9a227]/[0.09]',
};

export default function MosquePanel({ offers, taken, onPick }) {
  return (
    <section className="rounded-2xl border border-[#7fb3d5]/25 bg-black/35 p-3">
      <header className="flex items-center gap-2">
        <MoonStar className="h-4 w-4 text-[#9fe0ff]" />
        <h4 className="font-display text-sm text-[#eaf4ff]">The Mosque</h4>
        <span className="ml-auto text-[9px] uppercase tracking-[0.16em] text-[#8d7a63]">One blessing, yours for good</span>
      </header>

      {offers.length === 0 ? (
        <p className="mt-3 text-[11px] text-[#8d7a63]">Every teaching of the mosque has already been given to you.</p>
      ) : (
        <div className="mt-2 space-y-1.5">
          {offers.map((skill) => {
            const Icon = ICONS[skill.icon] || Sparkles;
            return (
              <div
                key={skill.id}
                className={`flex items-start gap-2 rounded-xl border px-2.5 py-2 ${TIERS[skill.tier] || TIERS.bronze} ${
                  taken ? 'opacity-60' : ''
                }`}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#cfe6f5]" />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] uppercase tracking-[0.12em] text-[#eaf4ff]">{skill.name}</div>
                  <p className="text-[10px] leading-snug text-[#a4917a]">{skill.desc}</p>
                </div>
                <button
                  onClick={() => onPick(skill.id)}
                  disabled={taken}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] transition-colors ${
                    taken
                      ? 'border-white/10 text-[#5f5245]'
                      : 'border-[#9fe0ff]/45 text-[#cfe6f5] hover:bg-[#9fe0ff]/12'
                  }`}
                >
                  {taken ? 'Taken' : 'Take'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {taken && (
        <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#7ddca0]">Blessing received — it stays with you</p>
      )}
    </section>
  );
}
