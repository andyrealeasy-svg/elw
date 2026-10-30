import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChevronRight, Gem, Radio, RotateCw, Sparkles, Swords, Ticket, X, Zap } from 'lucide-react';
import { PlayerProfile } from '../types';
import { getCharSplash } from '../data';
import { cn } from '../lib/utils';
import RiftDailyActivities from './RiftDailyActivities';

type Update15EventId = 'DD_COLLAB' | 'SIGNAL' | 'CALIBRATION' | 'HUNT';

interface Props {
  eventId: Update15EventId;
  profile: PlayerProfile;
  updateProfile: (updater: (p: PlayerProfile) => PlayerProfile) => void;
  setRoute: (route: any) => void;
}

const collabStages = [
  {
    id: 'event15_dd_1',
    title: 'Глава I: Незнакомая частота',
    description: 'В разломе между измерениями Хофманнита обнаруживает резонанс, которого нет ни в одном архиве. На сигнал откликается незнакомый ритм.',
    speaker: 'Хофманнита',
    characterId: 'hofmannita',
    level: 65,
    gems: 100,
    gold: 40000,
    tickets: 20,
  },
  {
    id: 'event15_dd_2',
    title: 'Глава II: Ритм по ту сторону',
    description: 'CMH проходит через разлом и помогает настроить нестабильный портал. Но его сигнал уже привлёк внимание стражей измерения.',
    speaker: 'CMH',
    characterId: 'cmh',
    level: 80,
    gems: 150,
    gold: 60000,
    tickets: 20,
  },
  {
    id: 'event15_dd_3',
    title: 'Глава III: Одно измерение',
    description: 'Хофманнита и CMH объединяют свои силы, чтобы остановить источник разлома и закрепить связь между мирами.',
    speaker: 'Хофманнита и CMH',
    characterId: 'cmh',
    level: 95,
    gems: 250,
    gold: 100000,
    tickets: 20,
  },
];

const storyChapters = [
  {
    id: 'event15_story_1',
    title: 'Глава I: Сигнал из-за грани',
    dialogue: [
      { characterId: 'hofmannita', speaker: 'Хофманнита', text: 'Странно... этот импульс не похож ни на одну помеху. Он повторяется в такт, будто кто-то пытается выйти на связь.' },
      { characterId: 'cmh', speaker: 'CMH', text: 'Связь установлена! Я слышу тебя сквозь шум. Похоже, нас разделяет не расстояние, а целое измерение.' },
      { characterId: 'hofmannita', speaker: 'Хофманнита', text: 'Тогда найдём источник и откроем проход. Но осторожно: сигнал слишком мощный, чтобы быть случайным.' },
    ],
  },
  {
    id: 'event15_story_2',
    title: 'Глава II: Частота разлома',
    dialogue: [
      { characterId: 'cmh', speaker: 'CMH', text: 'Я у портала. Его ритм сбивается — кто-то с той стороны пытается прорваться.' },
      { characterId: 'hofmannita', speaker: 'Хофманнита', text: 'Удерживай частоту! Я перенаправлю энергию разлома, пока ты стабилизируешь контур.' },
      { characterId: 'cmh', speaker: 'CMH', text: 'Контур держится. Но стражи уже идут на звук. Похоже, разговор придётся продолжить после боя.' },
    ],
  },
  {
    id: 'event15_story_3',
    title: 'Глава III: Резонанс миров',
    dialogue: [
      { characterId: 'hofmannita', speaker: 'Хофманнита', text: 'Разлом питается нашим же резонансом. По отдельности мы только усиливаем его.' },
      { characterId: 'cmh', speaker: 'CMH', text: 'Значит, сыграем в унисон. Ты задаёшь импульс — я удерживаю ритм.' },
      { characterId: 'hofmannita', speaker: 'Хофманнита', text: 'Есть контакт! Поток стабилен. Теперь наши миры могут слышать друг друга — без угрозы нового разлома.' },
    ],
  },
];

const smallEventInfo = {
  SIGNAL: {
    title: 'Эхо старого маяка',
    subtitle: 'Восстановите последовательность импульсов',
    description: 'Старый маяк сохранил короткий код. Повторите последовательность импульсов, чтобы получить награду.',
    gems: 80,
    gold: 20000,
    tickets: 10,
    key: 'event15SignalClaimed',
  },
  CALIBRATION: {
    title: 'Архив звёздных карт',
    subtitle: 'Откройте три шифровальных кольца',
    description: 'В обсерватории найден архив с зашифрованной картой. Выставьте три кольца на нужные значения и восстановите маршрут.',
    gems: 100,
    gold: 30000,
    tickets: 10,
    key: 'event15CalibrationClaimed',
  },
  HUNT: {
    title: 'Натиск в сумеречном лесу',
    subtitle: 'Ежедневный боевой вызов • отряд игрока',
    description: 'В сумеречном лесу каждый день появляется опасный противник. Победите его отрядом, чтобы получить ежедневную награду.',
    gems: 120,
    gold: 40000,
    tickets: 25,
    key: 'event15Hunt',
  },
} as const;

const sequence = [1, 3, 0, 2];
const ringTargets = [2, 0, 3];

export default function Update15Events({ eventId, profile, updateProfile, setRoute }: Props) {
  const [enteredSequence, setEnteredSequence] = useState<number[]>([]);
  const [rings, setRings] = useState([0, 0, 0]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [sequenceReveal, setSequenceReveal] = useState(0);
  const [sequenceVisible, setSequenceVisible] = useState(true);
  const [sequenceError, setSequenceError] = useState(false);
  const events = profile.events || {};
  const completedTestRuns: string[] = events.completedTestRuns || [];
  const completedStory: string[] = events.event15StoryCompleted || [];
  const eventTickets: number = events.event15Tickets || 0;
  const today = new Date().toISOString().slice(0, 10);
  const dailyHuntId = `event15_shadow_hunt_${today}`;

  useEffect(() => {
    if (eventId !== 'SIGNAL') return;
    setSequenceVisible(true);
    const timeout = window.setTimeout(() => setSequenceVisible(false), 3000);
    return () => window.clearTimeout(timeout);
  }, [eventId, sequenceReveal]);

  const claimPuzzleReward = (key: string, gems: number, gold: number, tickets: number) => {
    updateProfile(p => {
      if (p.events?.[key]) return p;
      return {
        ...p,
        gems: p.gems + gems,
        gold: p.gold + gold,
        events: { ...p.events, event15Tickets: (p.events?.event15Tickets || 0) + tickets, [key]: true },
      };
    });
  };

  const startBattle = (testId: string, title: string, trialId: number, gems: number, gold: number, tickets: number) => {
    const completed = completedTestRuns.includes(testId);
    setRoute({
      type: 'TRIAL_BATTLE',
      trialId,
      isTestRun: true,
      testId,
      title,
      team: profile.team,
      rewardGems: completed ? 0 : gems,
      rewardGold: completed ? 0 : gold,
      rewardEventCurrency: completed ? 0 : tickets,
    });
  };

  const finishStoryChapter = () => {
    if (activeStoryIndex === null) return;
    const chapter = storyChapters[activeStoryIndex];
    if (!completedStory.includes(chapter.id)) {
      updateProfile(p => {
        const previous: string[] = p.events?.event15StoryCompleted || [];
        if (previous.includes(chapter.id)) return p;
        return {
          ...p,
          events: {
            ...p.events,
            event15Tickets: (p.events?.event15Tickets || 0) + 10,
            event15StoryCompleted: [...previous, chapter.id],
          },
        };
      });
    }
    setActiveStoryIndex(null);
    setDialogueIndex(0);
  };

  if (eventId === 'DD_COLLAB') {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-fuchsia-400/30 bg-gradient-to-br from-fuchsia-950/60 via-[#111018] to-orange-950/30 p-6 sm:p-8">
          <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <img src={getCharSplash('hofmannita') || ''} alt="Хофманнита" className="h-24 w-20 rounded-2xl border border-white/10 bg-black/40 object-cover object-top sm:h-32 sm:w-24" />
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.25em] text-fuchsia-300">Крупное событие • Коллаборация</p>
                <h2 className="text-2xl font-black leading-tight text-white sm:text-4xl">На стыке миров</h2>
                <p className="mt-1 text-sm font-bold text-white/60">Хофманнита × CMH</p>
              </div>
              <img src={getCharSplash('cmh') || ''} alt="CMH" className="h-24 w-20 rounded-2xl border border-white/10 bg-black/40 object-cover object-top sm:h-32 sm:w-24" />
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-fuchsia-300/20 bg-black/30 px-4 py-3">
              <Ticket className="h-5 w-5 text-cyan-300" />
              <span className="text-xs font-bold text-white/70">{eventTickets} билетов Разлома</span>
            </div>
          </div>
          <p className="relative mt-5 max-w-3xl text-sm leading-relaxed text-white/65">
            Когда загадочный сигнал прорезает границу измерений, Хофманнита и CMH оказываются по разные стороны разлома.
            Пройдите историю, восстановите сигнал, исследуйте архив и вступите в бой. За активности выдаются билеты для
            особой гачи с коллаборационными персонажами.
          </p>
          <div className="relative mt-5 flex flex-wrap gap-3">
            <button onClick={() => setRoute('EVENT_GACHA')} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 px-5 py-3 text-xs font-black uppercase text-white shadow-lg shadow-fuchsia-950/40 transition hover:brightness-110 active:scale-95">
              <Sparkles className="h-4 w-4" /> Ивентовая гача
            </button>
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-[11px] font-bold text-white/55">
              10 билетов = 1 молитва • гарант G-ранга до 10 молитв
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/15 bg-cyan-300/5 px-4 py-3 text-[11px] font-bold text-cyan-100/75">
              115 билетов ежедневно • 805 за неделю — хватает на гарантированный C6 одного героя
            </span>
          </div>
        </section>

        <RiftDailyActivities profile={profile} updateProfile={updateProfile} />

        <section className="rounded-3xl border border-white/10 bg-[#101014] p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-300">Сюжетное событие</p>
              <h3 className="mt-1 text-xl font-black text-white">История разлома</h3>
            </div>
            <span className="text-[10px] font-bold text-white/40">За каждую главу: 10 билетов Разлома</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {storyChapters.map((chapter, index) => {
              const complete = completedStory.includes(chapter.id);
              const unlocked = index === 0 || completedStory.includes(storyChapters[index - 1].id);
              return (
                <article key={chapter.id} className="rounded-2xl border border-white/5 bg-black/30 p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-fuchsia-300">Глава {index + 1}</span>
                    {complete && <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
                  </div>
                  <h4 className="text-sm font-black text-white">{chapter.title}</h4>
                  <button disabled={!unlocked} onClick={() => { setActiveStoryIndex(index); setDialogueIndex(0); }} className="mt-4 w-full rounded-xl border border-fuchsia-300/20 bg-fuchsia-400/10 px-3 py-2 text-[10px] font-black uppercase text-fuchsia-100 transition hover:bg-fuchsia-400/20 disabled:cursor-not-allowed disabled:opacity-30">
                    {complete ? 'Перечитать' : unlocked ? 'Начать диалог' : 'Сначала предыдущая глава'}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
          {collabStages.map((stage, index) => {
            const completed = completedTestRuns.includes(stage.id);
            return (
              <article key={stage.id} className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111114]">
                <div className="relative h-36 bg-black/40">
                  <img src={getCharSplash(stage.characterId) || ''} alt={stage.speaker} className="h-full w-full object-cover object-[center_25%] opacity-65" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-black/10" />
                  <span className="absolute left-4 top-4 rounded-full border border-fuchsia-300/20 bg-black/60 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-fuchsia-200">
                    Глава {index + 1} • Ур. {stage.level}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-base font-black text-white">{stage.title}</h3>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-white/55">{stage.description}</p>
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/5 pt-3">
                    <span className="text-[10px] font-bold text-amber-200/80">💎 {stage.gems} · <span className="text-cyan-200">🎟 {stage.tickets}</span></span>
                    <button
                      onClick={() => startBattle(stage.id, `На стыке миров: ${stage.title}`, index + 1, stage.gems, stage.gold, stage.tickets)}
                      className="flex shrink-0 items-center gap-1 rounded-xl bg-fuchsia-600 px-3 py-2 text-[10px] font-black uppercase text-white transition hover:bg-fuchsia-500 active:scale-95"
                    >
                      {completed ? 'Повторить' : 'В бой'} <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {completed && <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-300"><CheckCircle2 className="h-3 w-3" /> Награда получена</div>}
                </div>
              </article>
            );
          })}
        </div>
        {activeStoryIndex !== null && (
          <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/90 p-4 sm:items-center sm:p-8">
            <div className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-fuchsia-300/25 bg-[#111116] shadow-2xl">
              <button onClick={() => setActiveStoryIndex(null)} className="absolute right-3 top-3 z-10 rounded-lg bg-black/50 p-2 text-white/60 transition hover:text-white" aria-label="Закрыть диалог"><X className="h-4 w-4" /></button>
              <div className="flex min-h-44 items-center justify-center bg-gradient-to-br from-fuchsia-950/50 to-black sm:min-h-56">
                <img src={getCharSplash(storyChapters[activeStoryIndex].dialogue[dialogueIndex].characterId) || ''} alt={storyChapters[activeStoryIndex].dialogue[dialogueIndex].speaker} className="max-h-56 object-contain object-top sm:max-h-72" />
              </div>
              <div className="p-5 sm:p-7">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-lg font-black text-white">{storyChapters[activeStoryIndex].dialogue[dialogueIndex].speaker}</h3>
                  <span className="text-[10px] font-mono text-white/35">{dialogueIndex + 1} / {storyChapters[activeStoryIndex].dialogue.length}</span>
                </div>
                <p className="min-h-16 text-sm leading-relaxed text-white/70">{storyChapters[activeStoryIndex].dialogue[dialogueIndex].text}</p>
                <button onClick={() => {
                  if (dialogueIndex < storyChapters[activeStoryIndex].dialogue.length - 1) setDialogueIndex(index => index + 1);
                  else finishStoryChapter();
                }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-fuchsia-600 px-4 py-3 text-xs font-black uppercase text-white transition hover:bg-fuchsia-500">
                  {dialogueIndex < storyChapters[activeStoryIndex].dialogue.length - 1 ? 'Далее' : completedStory.includes(storyChapters[activeStoryIndex].id) ? 'Завершить' : 'Завершить и получить 10 билетов'}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const info = smallEventInfo[eventId];
  const completed = eventId === 'HUNT'
    ? completedTestRuns.includes(dailyHuntId)
    : Boolean(events[info.key]);
  const signalSolved = enteredSequence.length === sequence.length && enteredSequence.every((value, index) => value === sequence[index]);
  const calibrationSolved = rings.every((value, index) => value === ringTargets[index]);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#17191e] to-[#0b0b0d] p-6 sm:p-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10">
          {eventId === 'SIGNAL' ? <Radio className="h-6 w-6 text-cyan-300" /> : eventId === 'CALIBRATION' ? <RotateCw className="h-6 w-6 text-cyan-300" /> : <Swords className="h-6 w-6 text-cyan-300" />}
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Событие обновления 1.5</p>
        <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">{info.title}</h2>
        <p className="mt-1 text-xs font-bold text-cyan-100/60">{info.subtitle}</p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">{info.description}</p>
        <div className="mt-5 flex items-center gap-2 text-xs font-bold text-amber-200"><Gem className="h-4 w-4" /> Награда: {info.gems} камней, {info.gold.toLocaleString('ru-RU')} золота и {info.tickets} билетов Разлома</div>
      </section>

      {eventId === 'SIGNAL' && (
        <section className="rounded-2xl border border-white/10 bg-[#111114] p-5 sm:p-6">
          <p className="mb-3 text-center text-xs font-bold text-white/60">Запомните код маяка — он исчезнет через несколько секунд:</p>
          <div className="mb-5 flex items-center justify-center gap-3">
            {sequence.map((value, index) => <span key={index} className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-lg text-cyan-200">{sequenceVisible || signalSolved ? ['●', '◆', '▲', '■'][value] : '·'}</span>)}
          </div>
          <div className="mb-3 flex flex-wrap items-center justify-center gap-3">
            <p className="text-xs font-bold text-white/60">Повторите импульсы по порядку:</p>
            <button onClick={() => setSequenceReveal(value => value + 1)} className="text-[10px] font-bold text-cyan-300 transition hover:text-cyan-100">Показать код ещё раз</button>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {['●', '◆', '▲', '■'].map((symbol, value) => (
              <button key={symbol} disabled={completed || signalSolved || sequenceVisible} onClick={() => {
                const next = [...enteredSequence, value];
                if (next.some((entry, index) => entry !== sequence[index])) {
                  setEnteredSequence([]);
                  setSequenceError(true);
                } else {
                  setEnteredSequence(next);
                  setSequenceError(false);
                }
              }} className="h-12 w-12 rounded-xl border border-white/10 bg-white/5 text-xl text-white transition hover:border-cyan-300/40 hover:bg-cyan-400/10 disabled:opacity-40">{symbol}</button>
            ))}
          </div>
          <p className={cn('mt-3 text-center text-[11px]', sequenceError ? 'text-rose-300' : 'text-white/40')}>{sequenceError ? 'Последовательность сбилась — попробуйте снова.' : `${enteredSequence.length} / ${sequence.length} импульса`}</p>
        </section>
      )}

      {eventId === 'CALIBRATION' && (
        <section className="rounded-2xl border border-white/10 bg-[#111114] p-5 sm:p-6">
          <p className="mb-4 text-center text-xs leading-relaxed text-white/60">Запись астронома: первое кольцо — противоположная сторона, второе — исходная точка, последнее — три шага вперёд.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {rings.map((value, index) => (
              <button key={index} disabled={completed || calibrationSolved} onClick={() => setRings(prev => prev.map((ring, ringIndex) => ringIndex === index ? (ring + 1) % 4 : ring))} className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/5 text-cyan-100 transition hover:bg-cyan-400/10 disabled:opacity-40">
                <RotateCw className={cn('mb-1 h-4 w-4', value === ringTargets[index] && 'text-emerald-300')} />
                <span className="font-mono text-lg font-black">{value + 1}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-[#111114] p-5 text-center">
        {eventId === 'HUNT' ? (
          <button onClick={() => startBattle(dailyHuntId, info.title, 3, info.gems, info.gold, info.tickets)} className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-xs font-black uppercase text-white transition hover:bg-cyan-500 active:scale-95">
            <Zap className="h-4 w-4" /> {completed ? 'Повторить бой без награды' : 'Начать ежедневное испытание'}
          </button>
        ) : (
          <button
            disabled={completed || (eventId === 'SIGNAL' ? !signalSolved : !calibrationSolved)}
            onClick={() => claimPuzzleReward(info.key, info.gems, info.gold, info.tickets)}
            className={cn('rounded-xl px-6 py-3 text-xs font-black uppercase transition active:scale-95', completed ? 'cursor-not-allowed border border-white/5 bg-white/5 text-white/30' : (eventId === 'SIGNAL' ? signalSolved : calibrationSolved) ? 'bg-cyan-500 text-black hover:bg-cyan-400' : 'cursor-not-allowed bg-white/5 text-white/25')}
          >
            {completed ? 'Награда получена' : 'Забрать награду'}
          </button>
        )}
        {completed && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> {eventId === 'HUNT' ? 'Ежедневная награда получена' : 'Первое прохождение завершено'}</span>}
        {(eventId === 'SIGNAL' || eventId === 'CALIBRATION') && !completed && (
          <button onClick={() => {
            if (eventId === 'SIGNAL') {
              setEnteredSequence([]);
              setSequenceError(false);
            } else {
              setRings([0, 0, 0]);
            }
          }} className="text-[10px] font-bold text-white/35 transition hover:text-white/70">
            <Sparkles className="mr-1 inline h-3 w-3" /> Сбросить настройку
          </button>
        )}
      </div>
    </div>
  );
}
