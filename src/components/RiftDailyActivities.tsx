import React, { useEffect, useState } from 'react';
import { CheckCircle2, Radio, RotateCw, Sparkles } from 'lucide-react';
import { PlayerProfile } from '../types';
import { cn } from '../lib/utils';

interface Props {
  profile: PlayerProfile;
  updateProfile: (updater: (p: PlayerProfile) => PlayerProfile) => void;
}

const activityRewards = 30;
const symbols = ['●', '◆', '▲', '■'];

const dateSeed = (date: string) => date.split('').reduce((total, char) => total + char.charCodeAt(0), 0);

export default function RiftDailyActivities({ profile, updateProfile }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const seed = dateSeed(today);
  const sequence = Array.from({ length: 5 }, (_, index) => (seed * (index + 3) + index * 7) % 4);
  const middle = seed % 4;
  const targets = [((middle + 1) % 4), middle, ((middle + 3) % 4)];
  const progress = profile.events?.event15DailyProgress;
  const claimed: string[] = progress?.date === today ? progress.claimed || [] : [];
  const [sequenceVisible, setSequenceVisible] = useState(true);
  const [sequenceInput, setSequenceInput] = useState<number[]>([]);
  const [sequenceError, setSequenceError] = useState(false);
  const [reveals, setReveals] = useState(0);
  const [cards, setCards] = useState<{ id: number; symbol: string; revealed: boolean; matched: boolean }[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [cardsLocked, setCardsLocked] = useState(false);
  const [rings, setRings] = useState([0, 0, 0]);

  const sequenceDone = claimed.includes('sequence');
  const memoryDone = claimed.includes('memory');
  const ringsDone = claimed.includes('rings');
  const allDone = sequenceDone && memoryDone && ringsDone;

  useEffect(() => {
    setSequenceVisible(true);
    const timeout = window.setTimeout(() => setSequenceVisible(false), 2800);
    return () => window.clearTimeout(timeout);
  }, [today, reveals]);

  useEffect(() => {
    const deck = [...symbols.slice(0, 3), ...symbols.slice(0, 3)]
      .map((symbol, id) => ({ id, symbol, revealed: false, matched: false }))
      .sort((a, b) => ((a.id * (seed + 17)) % 13) - ((b.id * (seed + 17)) % 13));
    setCards(deck);
    setSelectedCards([]);
    setRings([0, 0, 0]);
  }, [today, seed]);

  const completeActivity = (activityId: string) => {
    updateProfile(p => {
      const current = p.events?.event15DailyProgress;
      const currentClaims: string[] = current?.date === today ? current.claimed || [] : [];
      if (currentClaims.includes(activityId)) return p;
      return {
        ...p,
        events: {
          ...p.events,
          event15Tickets: (p.events?.event15Tickets || 0) + activityRewards,
          event15DailyProgress: { date: today, claimed: [...currentClaims, activityId] },
        },
      };
    });
  };

  const handleSequenceInput = (value: number) => {
    if (sequenceDone || sequenceVisible) return;
    const next = [...sequenceInput, value];
    if (next.some((entry, index) => entry !== sequence[index])) {
      setSequenceInput([]);
      setSequenceError(true);
      return;
    }
    setSequenceInput(next);
    setSequenceError(false);
    if (next.length === sequence.length) completeActivity('sequence');
  };

  const handleCardClick = (cardIndex: number) => {
    if (memoryDone || cardsLocked || selectedCards.includes(cardIndex) || cards[cardIndex]?.matched || cards[cardIndex]?.revealed) return;
    const nextCards = [...cards];
    nextCards[cardIndex] = { ...nextCards[cardIndex], revealed: true };
    const nextSelection = [...selectedCards, cardIndex];
    setCards(nextCards);
    setSelectedCards(nextSelection);
    if (nextSelection.length !== 2) return;

    const [firstIndex, secondIndex] = nextSelection;
    if (nextCards[firstIndex].symbol === nextCards[secondIndex].symbol) {
      nextCards[firstIndex] = { ...nextCards[firstIndex], matched: true };
      nextCards[secondIndex] = { ...nextCards[secondIndex], matched: true };
      setCards(nextCards);
      setSelectedCards([]);
      if (nextCards.every(card => card.matched)) completeActivity('memory');
      return;
    }

    setCardsLocked(true);
    window.setTimeout(() => {
      setCards(previous => previous.map((card, index) => index === firstIndex || index === secondIndex ? { ...card, revealed: false } : card));
      setSelectedCards([]);
      setCardsLocked(false);
    }, 750);
  };

  const ringSolved = rings.every((value, index) => value === targets[index]);

  return (
    <section className="rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-[#10171b] to-[#0b0b0d] p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Ежедневные активности • сброс каждый день</p>
          <h3 className="mt-1 text-xl font-black text-white">Испытания разлома</h3>
          <p className="mt-1 text-xs text-white/45">Три мини-игры, по 30 билетов за каждую. Боевой вызов приносит ещё 25 билетов за день.</p>
        </div>
        <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/5 px-3 py-2 text-xs font-black text-cyan-100">
          {Number(sequenceDone) + Number(memoryDone) + Number(ringsDone)} / 3 завершено
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-white/5 bg-black/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-black text-white"><Radio className="h-4 w-4 text-cyan-300" /> Ритм сигнала</h4>
            {sequenceDone && <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
          </div>
          <p className="mb-3 min-h-8 text-[10px] leading-relaxed text-white/45">Запомните и повторите сегодняшнюю последовательность из пяти импульсов.</p>
          <div className="mb-3 flex justify-center gap-1.5">
            {sequence.map((value, index) => <span key={index} className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-300/15 bg-cyan-300/5 text-sm text-cyan-100">{sequenceVisible || sequenceDone ? symbols[value] : '·'}</span>)}
          </div>
          <div className="flex justify-center gap-1.5">
            {symbols.map((symbol, value) => <button key={symbol} disabled={sequenceDone || sequenceVisible} onClick={() => handleSequenceInput(value)} className="h-9 w-9 rounded-lg border border-white/10 bg-white/5 text-sm text-white transition hover:border-cyan-300/30 disabled:opacity-30">{symbol}</button>)}
          </div>
          <p className={cn('mt-2 min-h-4 text-center text-[9px]', sequenceError ? 'text-rose-300' : 'text-white/35')}>{sequenceDone ? 'Награда получена' : sequenceVisible ? 'Слушайте внимательно…' : sequenceError ? 'Сигнал сбился — начните последовательность заново.' : `${sequenceInput.length} / ${sequence.length}`}</p>
          {!sequenceVisible && !sequenceDone && <button onClick={() => { setSequenceInput([]); setSequenceError(false); setReveals(value => value + 1); }} className="mt-1 w-full text-[9px] font-bold text-cyan-300/70 hover:text-cyan-100">Повторить сигнал</button>}
        </article>

        <article className="rounded-2xl border border-white/5 bg-black/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-black text-white"><Sparkles className="h-4 w-4 text-fuchsia-300" /> Парные эхо-образы</h4>
            {memoryDone && <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
          </div>
          <p className="mb-3 min-h-8 text-[10px] leading-relaxed text-white/45">Найдите три пары символов. Поле меняется каждый день.</p>
          <div className="mx-auto grid max-w-[180px] grid-cols-3 gap-1.5">
            {cards.map((card, index) => <button key={card.id} disabled={memoryDone || cardsLocked || card.matched} onClick={() => handleCardClick(index)} className={cn('flex h-10 items-center justify-center rounded-lg border text-lg transition', card.matched ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200' : card.revealed ? 'border-fuchsia-300/25 bg-fuchsia-300/10 text-fuchsia-100' : 'border-white/5 bg-white/5 text-white/15 hover:border-fuchsia-300/20')}>{card.revealed || card.matched ? card.symbol : '?'}</button>)}
          </div>
          <p className="mt-2 min-h-4 text-center text-[9px] text-white/35">{memoryDone ? 'Награда получена' : 'Найдите все пары'}</p>
        </article>

        <article className="rounded-2xl border border-white/5 bg-black/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-black text-white"><RotateCw className="h-4 w-4 text-amber-300" /> Замок портала</h4>
            {ringsDone && <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
          </div>
          <p className="mb-3 min-h-8 text-[10px] leading-relaxed text-white/45">Подсказка: среднее кольцо показывает {middle + 1}. Левое на один шаг впереди него, правое на один шаг позади среднего.</p>
          <div className="mb-3 flex justify-center gap-2">
            {rings.map((value, index) => <button key={index} disabled={ringsDone} onClick={() => setRings(previous => previous.map((ring, ringIndex) => ringIndex === index ? (ring + 1) % 4 : ring))} className={cn('flex h-11 w-11 items-center justify-center rounded-xl border font-mono text-lg font-black transition', value === targets[index] ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200' : 'border-white/10 bg-white/5 text-white/75 hover:border-amber-300/30')}>{value + 1}</button>)}
          </div>
          <button disabled={ringsDone || !ringSolved} onClick={() => completeActivity('rings')} className="w-full rounded-lg bg-amber-400/10 py-2 text-[10px] font-black uppercase text-amber-200 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-30">{ringsDone ? 'Награда получена' : 'Зафиксировать настройку'}</button>
        </article>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-cyan-300/10 bg-cyan-300/5 py-2 text-[10px] font-bold text-cyan-100/70">
        <Sparkles className="h-3.5 w-3.5" /> Награды мини-игр: {Number(sequenceDone) * activityRewards + Number(memoryDone) * activityRewards + Number(ringsDone) * activityRewards} / 90 билетов сегодня
        {allDone && <span className="text-emerald-300"> • Всё готово</span>}
      </div>
    </section>
  );
}
