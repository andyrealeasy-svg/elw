import React, { useState } from 'react';
import { ArrowLeft, Check, Flame, Leaf, Mountain, Snowflake, Target, Users, Zap, Droplets, Shield } from 'lucide-react';
import { characterBlueprints, charRarity, getCharSplash } from '../data';
import { Element, PlayerProfile } from '../types';
import { cn } from '../lib/utils';

const elementLabels: Record<Element, string> = {
  Hydro: 'Гидро',
  Pyro: 'Пиро',
  Dendro: 'Дендро',
  Electro: 'Электро',
  Geo: 'Гео',
  Physical: 'Физический',
  Cryo: 'Крио',
};

const rarityStyles: Record<string, string> = {
  G: 'border-fuchsia-400/40 bg-fuchsia-500/20 text-fuchsia-200',
  S: 'border-amber-400/40 bg-amber-500/20 text-amber-200',
  A: 'border-purple-400/40 bg-purple-500/20 text-purple-200',
  B: 'border-slate-300/30 bg-slate-500/20 text-slate-200',
};

const auraOptions: Array<{ element: Element | null; label: string; color: string; icon: React.ReactNode }> = [
  { element: null, label: 'Нет ауры', color: 'border-white/20 text-white/70', icon: <Shield className="h-4 w-4" /> },
  { element: 'Pyro', label: 'Пиро', color: 'border-red-500/40 text-red-300', icon: <Flame className="h-4 w-4" /> },
  { element: 'Hydro', label: 'Гидро', color: 'border-blue-500/40 text-blue-300', icon: <Droplets className="h-4 w-4" /> },
  { element: 'Electro', label: 'Электро', color: 'border-purple-500/40 text-purple-300', icon: <Zap className="h-4 w-4" /> },
  { element: 'Dendro', label: 'Дендро', color: 'border-emerald-500/40 text-emerald-300', icon: <Leaf className="h-4 w-4" /> },
  { element: 'Cryo', label: 'Крио', color: 'border-cyan-500/40 text-cyan-300', icon: <Snowflake className="h-4 w-4" /> },
  { element: 'Geo', label: 'Гео', color: 'border-amber-500/40 text-amber-300', icon: <Mountain className="h-4 w-4" /> },
];

interface Props {
  profile: PlayerProfile;
  onBack: () => void;
  onStartBattle: (settings: {
    teamIds: string[];
    aura: Element | null;
    attacksEnabled: boolean;
    attackPower: number;
    attackSpeed: number;
  }) => void;
}

export default function TrainingGroundMenu({ profile, onBack, onStartBattle }: Props) {
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [aura, setAura] = useState<Element | null>(null);
  const [attacksEnabled, setAttacksEnabled] = useState(false);
  const [attackPower, setAttackPower] = useState(100);
  const [attackSpeed, setAttackSpeed] = useState(100);
  const ownedCharacters = Object.entries(profile.roster)
    .filter(([id]) => !!characterBlueprints[id])
    .map(([id, data]) => ({ id, data, character: characterBlueprints[id](id, data.level || 1, data.constellation || 0) }));

  const toggleCharacter = (id: string) => {
    setTeamIds(current => current.includes(id)
      ? current.filter(characterId => characterId !== id)
      : current.length < 4 ? [...current, id] : current);
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-white/60 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Назад
        </button>
        <div className="mb-8 flex items-center gap-4">
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300"><Target className="h-7 w-7" /></div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-widest sm:text-3xl">Тест отряда</h1>
            <p className="mt-1 text-xs text-white/45">Манекен с бесконечным HP • 60 секунд • без наград</p>
          </div>
        </div>

        <section className="mb-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">Выберите персонажей</h2>
            <span className="text-xs font-mono text-cyan-300">{teamIds.length} / 4</span>
          </div>
          {ownedCharacters.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-white/50">Нет доступных персонажей для теста.</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {ownedCharacters.map(({ id, data, character }) => {
                const selected = teamIds.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleCharacter(id)}
                    aria-pressed={selected}
                    className={cn(
                      'relative overflow-hidden rounded-2xl border text-left transition-all',
                      selected ? 'border-cyan-400/70 bg-cyan-400/10 ring-1 ring-cyan-400/30' : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
                    )}
                  >
                    <span className="relative block h-28 overflow-hidden bg-[#11151a]">
                      {getCharSplash(id) || character.image ? (
                        <img
                          src={getCharSplash(id) || character.image}
                          alt=""
                          className="h-full w-full object-cover object-top"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-4xl font-black text-white/30">{character.name.charAt(0)}</span>
                      )}
                      <span className={cn('absolute left-2 top-2 rounded-md border px-2 py-0.5 text-[10px] font-black', rarityStyles[charRarity[id] || 'B'])}>
                        {charRarity[id] || 'B'}
                      </span>
                      {selected && (
                        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400 text-black shadow-lg">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </span>
                    <span className="block p-3">
                      <span className="block truncate text-sm font-bold">{character.name}</span>
                      <span className="mt-1 block text-[10px] uppercase tracking-wider text-white/45">
                        {elementLabels[character.element]} <span className="text-white/20">•</span> Ур. {data.level || 1}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <p className="mt-2 text-[11px] text-white/35">В бой попадут текущие уровни, созвездия и экипировка выбранных персонажей.</p>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/80">Аура манекена</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {auraOptions.map(option => (
                <button
                  key={option.element || 'none'}
                  type="button"
                  onClick={() => setAura(option.element)}
                  aria-pressed={aura === option.element}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl border bg-black/20 px-3 py-2.5 text-xs font-semibold transition-colors',
                    option.color,
                    aura === option.element ? 'ring-1 ring-current' : 'opacity-70 hover:opacity-100'
                  )}
                >
                  {option.icon}{option.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-white/35">Выбранная аура накладывается в начале боя и расходуется обычными реакциями.</p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">Атаки манекена</h2>
                <p className="mt-1 text-[11px] text-white/40">Настройте давление на отряд</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={attacksEnabled}
                onClick={() => setAttacksEnabled(enabled => !enabled)}
                className={cn('relative h-7 w-12 rounded-full transition-colors', attacksEnabled ? 'bg-cyan-500' : 'bg-white/15')}
              >
                <span className={cn('absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform', attacksEnabled ? 'translate-x-5' : 'translate-x-0')} />
              </button>
            </div>
            <label className={cn('mb-4 block', !attacksEnabled && 'opacity-40')}>
              <span className="mb-2 flex justify-between text-xs text-white/65"><span>Сила атаки</span><span>{attackPower}%</span></span>
              <input
                disabled={!attacksEnabled}
                type="range"
                min="25"
                max="300"
                step="25"
                value={attackPower}
                onChange={event => setAttackPower(Number(event.target.value))}
                style={{ background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((attackPower - 25) / 275) * 100}%, rgba(255,255,255,0.2) ${((attackPower - 25) / 275) * 100}%, rgba(255,255,255,0.2) 100%)` }}
                className="training-range w-full"
              />
              <span className="mt-1 block text-[10px] text-white/35">Множитель урона базовой атаки</span>
            </label>
            <label className={cn('block', !attacksEnabled && 'opacity-40')}>
              <span className="mb-2 flex justify-between text-xs text-white/65"><span>Частота ходов</span><span>{attackSpeed}%</span></span>
              <input
                disabled={!attacksEnabled}
                type="range"
                min="40"
                max="200"
                step="10"
                value={attackSpeed}
                onChange={event => setAttackSpeed(Number(event.target.value))}
                style={{ background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((attackSpeed - 40) / 160) * 100}%, rgba(255,255,255,0.2) ${((attackSpeed - 40) / 160) * 100}%, rgba(255,255,255,0.2) 100%)` }}
                className="training-range w-full"
              />
              <span className="mt-1 block text-[10px] text-white/35">Скорость накопления шкалы хода</span>
            </label>
          </section>
        </div>

        <div className="mt-7 flex flex-col items-center justify-between gap-4 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4 sm:flex-row">
          <div className="flex items-center gap-3 text-xs text-white/55">
            <Users className="h-4 w-4 text-cyan-300" />
            <span>Таймер: <strong className="text-white">60 секунд</strong>. Бой можно завершить вручную.</span>
          </div>
          <button
            type="button"
            disabled={teamIds.length === 0}
            onClick={() => onStartBattle({ teamIds, aura, attacksEnabled, attackPower, attackSpeed })}
            className="w-full rounded-xl bg-cyan-500 px-6 py-3 text-sm font-black uppercase tracking-widest text-black transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto"
          >
            Начать тест
          </button>
        </div>
      </div>
    </div>
  );
}
