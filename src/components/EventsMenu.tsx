import React, { useState } from 'react';
import { PlayerProfile } from '../types';
import { CheckCircle2, Gift, Radio, RotateCw, Sparkles, Swords } from 'lucide-react';
import { cn } from '../lib/utils';
import { getCharSplash, characterBlueprints } from '../data';
import VkusnoCollabEvent, { VkusnoLogo } from './VkusnoCollabEvent';
import Update15Events from './Update15Events';

interface Props {
  profile: PlayerProfile;
  updateProfile: (updater: (p: PlayerProfile) => PlayerProfile) => void;
  setRoute: (r: any) => void;
}

export default function EventsMenu({ profile, updateProfile, setRoute }: Props) {
  const [subTab, setSubTab] = useState<'TESTRUN' | 'VKUSNO' | 'UPDATE' | 'LOGIN' | 'DD_COLLAB' | 'SIGNAL' | 'CALIBRATION' | 'HUNT'>('DD_COLLAB');
  // Dates & Checks
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper getters
  const eventsData = profile.events || {};
  // EVENT 5: TEST RUN (ACCORDING TO BANNERS)
  // Squads strictly following user's instructions:
  // Вайрен: Вайрен + Фенрис + Нереус + Авелин
  // Зефир: Зефир + Инеффа + Эгида + Рикс
  // Аурум: Аурум + Инеффа + Нейрон + Рикс
  // Крона: Крона + Аэлита + Ива + Гайя
  // ==========================================
  const testRuns = [
    { 
      id: 'test_vairen', 
      char: 'vairen', 
      title: 'Вайрен',
      desc: 'Сердце Древнего Леса • Тёмные Семена & Цветы',
      team: ['vairen', 'fenris', 'nereus', 'aveline'] 
    },
    { 
      id: 'test_zephyr', 
      char: 'zephyr', 
      title: 'Зефир',
      desc: 'Грозовая Призма • Ускорение Отражения',
      team: ['zephyr', 'ineffa', 'aegis', 'rix'] 
    },
    { 
      id: 'test_aurum', 
      char: 'aurum', 
      title: 'Аурум',
      desc: 'Золотая Эгида • Тектонический Щит & Крит-Бафф',
      team: ['aurum', 'ineffa', 'neuron', 'rix'] 
    },
    { 
      id: 'test_krona', 
      char: 'krona', 
      title: 'Крона',
      desc: 'Вектор Времени • Крио-Застой & Темпоральный Сдвиг',
      team: ['krona', 'aelita', 'iva', 'gaia'] 
    },
  ];

  const completedTestRuns: string[] = eventsData.completedTestRuns || [];

  const handleStartTestRun = (testId: string, team: string[], charName?: string) => {
    const isCompleted = completedTestRuns.includes(testId);
    setRoute({
      type: 'TRIAL_BATTLE',
      trialId: 1, 
      isTestRun: true,
      testId,
      team,
      title: charName ? `Тестовый Забег: ${charName}` : "Тестовый Забег",
      rewardGems: isCompleted ? 0 : 50,
      rewardGold: isCompleted ? 0 : 10000
    });
  };

  // ==========================================
  // EVENT 7: LOGIN (7 DAYS)
  // ==========================================
  const lastLoginDate = eventsData.initLastClaimDay || "";
  const loginStreak = eventsData.initStreak || 0;
  const alreadyCheckedIn = lastLoginDate === todayStr;

  const handleCheckIn = () => {
    if (alreadyCheckedIn) return;
    const nextStreak = loginStreak >= 7 ? 1 : loginStreak + 1;
    updateProfile(p => ({
      ...p, gems: p.gems + 160, gold: p.gold + (nextStreak * 5000),
      events: { ...p.events, initStreak: nextStreak, initLastClaimDay: todayStr }
    }));
  };

  return (
    <div className="flex flex-col md:flex-row h-full select-none">
      {/* Sidebar */}
      <div className="w-full md:w-64 lg:w-72 border-r border-white/5 bg-[#0a0a0a] p-4 flex flex-col gap-2 overflow-y-auto shrink-0 md:h-[calc(100vh-120px)] hide-scrollbar">
        <h3 className="text-white/30 text-xs font-black uppercase tracking-widest mb-2 px-2">События</h3>
        
        <button onClick={() => setSubTab('DD_COLLAB')} className={cn("flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left font-bold transition shrink-0", subTab === 'DD_COLLAB' ? "border-fuchsia-400/40 bg-fuchsia-950/40 text-white" : "border-white/5 bg-[#111111]/40 text-white/65 hover:bg-[#191919]")}>
          <Sparkles className="h-5 w-5 shrink-0 text-fuchsia-300" />
          <span className="min-w-0 flex-1"><span className="block text-[9px] font-black uppercase tracking-wider text-fuchsia-300">Крупное событие</span><span className="block text-xs">На стыке миров</span></span>
        </button>
        <button onClick={() => setSubTab('SIGNAL')} className={cn("flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold transition shrink-0", subTab === 'SIGNAL' ? "border-cyan-400/30 bg-cyan-950/30 text-white" : "border-white/5 text-white/60 hover:bg-white/5")}>
          <Radio className="h-4 w-4 text-cyan-300" /> Эхо старого маяка
        </button>
        <button onClick={() => setSubTab('CALIBRATION')} className={cn("flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold transition shrink-0", subTab === 'CALIBRATION' ? "border-cyan-400/30 bg-cyan-950/30 text-white" : "border-white/5 text-white/60 hover:bg-white/5")}>
          <RotateCw className="h-4 w-4 text-cyan-300" /> Архив звёздных карт
        </button>
        <button onClick={() => setSubTab('HUNT')} className={cn("flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold transition shrink-0", subTab === 'HUNT' ? "border-cyan-400/30 bg-cyan-950/30 text-white" : "border-white/5 text-white/60 hover:bg-white/5")}>
          <Swords className="h-4 w-4 text-cyan-300" /> Натиск в сумеречном лесу
        </button>

        {/* TEST RUN */}
        <button 
          onClick={() => setSubTab('TESTRUN')} 
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition shrink-0", 
            subTab === 'TESTRUN' ? "bg-amber-500/20 text-amber-300 shadow-lg border border-amber-500/30" : "text-white/50 hover:bg-[#1a1a1a]/50"
          )}
        >
          <Swords className="w-4 h-4" /> 
          <div className="text-left leading-tight">
            <div className="text-[10px] opacity-70">Специальное</div>
            Тестовый Забег
          </div>
        </button>

        {/* VKUSNO I TOCHKA COLLABORATION */}
        <button 
          onClick={() => setSubTab('VKUSNO')} 
          className={cn(
            "flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold transition shrink-0 relative overflow-hidden border",
            subTab === 'VKUSNO' 
              ? "bg-[#003c2f] text-emerald-200 border-[#005a46] shadow-md shadow-black/40" 
              : "bg-[#091410] text-white/80 hover:bg-[#003c2f]/40 hover:text-white border-[#005a46]/30"
          )}
        >
          <VkusnoLogo className="w-7 h-7 shrink-0" />
          <div className="text-left leading-tight flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-white bg-[#f35115] px-1.5 py-0.2 rounded">Коллаб</span>
              <span className="text-[9px] text-[#f59e0b] font-bold truncate">Сайрус & Рейвен</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-white">Вкусно — и точка</div>
          </div>
        </button>
        
        <div className="h-px bg-white/10 w-full my-2"></div>

        {/* UPDATE 1.5 */}
        <button 
          onClick={() => setSubTab('UPDATE')} 
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition shrink-0", 
            subTab === 'UPDATE' ? "bg-emerald-600 text-white" : "text-white/50 hover:bg-[#1a1a1a]/50"
          )}
        >
          <Gift className="w-4 h-4" /> Обновление 1.5
        </button>

        {/* LOGIN 7 DAYS */}
        <button 
          onClick={() => setSubTab('LOGIN')} 
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition shrink-0", 
            subTab === 'LOGIN' ? "bg-indigo-600 text-white" : "text-white/50 hover:bg-[#1a1a1a]/50"
          )}
        >
          <Sparkles className="w-4 h-4" /> Инициализация
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-black/40 overflow-y-auto relative h-[calc(100vh-160px)] md:h-[calc(100vh-120px)] hide-scrollbar">
        {(subTab === 'DD_COLLAB' || subTab === 'SIGNAL' || subTab === 'CALIBRATION' || subTab === 'HUNT') && (
          <Update15Events
            eventId={subTab}
            profile={profile}
            updateProfile={updateProfile}
            setRoute={setRoute}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 5: TEST RUN (BANNER SQUADS)                          */}
        {/* ======================================================== */}
        {subTab === 'TESTRUN' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-amber-900/40 to-black border border-amber-500/30 rounded-3xl p-6 relative overflow-hidden">
               <h2 className="text-2xl sm:text-3xl font-black text-amber-400 uppercase tracking-tight flex items-center gap-3">
                 <Swords className="w-8 h-8" /> Тестовый Забег (Баннеры 1.4)
               </h2>
               <p className="text-sm text-white/60 mt-2 max-w-2xl leading-relaxed">
                 Испытайте персонажей текущих баннеров в сбалансированных синергетических отрядах на среднем уровне прокачки! Получите 50 Гемов за каждое первое прохождение.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testRuns.map((tr) => {
                const isCompleted = completedTestRuns.includes(tr.id);
                const charSplash = getCharSplash(tr.char);
                const charName = tr.title || characterBlueprints[tr.char]?.(tr.char, 1, 0, []).name || tr.char;
                return (
                  <div key={tr.id} className="relative rounded-2xl overflow-hidden border border-white/10 group h-56">
                    <img src={charSplash || ''} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition duration-500 scale-105 group-hover:scale-110" alt="splash" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 flex flex-col justify-end">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-black text-white">{charName}</h3>
                          {tr.desc && <p className="text-[10px] text-amber-300/80 font-mono">{tr.desc}</p>}
                        </div>
                        {isCompleted && (
                          <span className="text-[10px] font-bold text-green-400 bg-green-500/20 border border-green-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Пройдено
                          </span>
                        )}
                      </div>
                      
                      {/* Squad members roster preview */}
                      <div className="flex items-center gap-2 mt-2 mb-3">
                        {tr.team.map((tid, i) => {
                          const cInfo = characterBlueprints[tid]?.(tid, 1, 0, []);
                          return (
                            <div key={i} className="flex flex-col items-center">
                              <div className="w-9 h-9 rounded-full border border-white/20 overflow-hidden bg-black/60 shadow-md">
                                <img src={getCharSplash(tid) || ''} className="w-full h-full object-cover" alt={tid} />
                              </div>
                              <span className="text-[8px] font-mono text-white/60 truncate max-w-[40px] text-center mt-0.5">{cInfo?.name || tid}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={cn("text-xs font-mono font-bold px-2 py-1 rounded", isCompleted ? "text-white/40 bg-white/5 line-through" : "text-amber-400 bg-amber-500/10")}>
                          💎 50 Гемов {isCompleted && <span className="no-underline text-white/40 text-[10px] ml-1">(получено)</span>}
                        </span>
                        {isCompleted ? (
                          <button 
                            onClick={() => handleStartTestRun(tr.id, tr.team, charName)} 
                            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-xs font-bold uppercase tracking-wider transition border border-white/10 flex items-center gap-1 active:scale-95 cursor-pointer"
                            title="Повторить забег (без наград)"
                          >
                            Повтор
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStartTestRun(tr.id, tr.team, charName)} 
                            className="px-6 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-amber-900/50 active:scale-95 cursor-pointer"
                          >
                            Испытать
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: VKUSNO COLLABORATION                              */}
        {/* ======================================================== */}
        {subTab === 'VKUSNO' && (
          <VkusnoCollabEvent
            profile={profile}
            updateProfile={updateProfile}
            setRoute={setRoute}
          />
        )}

        {/* ======================================================== */}
        {/* TAB: UPDATE 1.5 (800 GEMS)                               */}
        {/* ======================================================== */}
        {subTab === 'UPDATE' && (
          <div className="flex flex-col items-center justify-center h-full w-full max-w-lg mx-auto">
            <div className="w-full bg-[#0a0a0a] border border-emerald-500/30 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl mb-4">
                💎
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Обновление 1.5</h2>
              <p className="text-xs font-mono text-emerald-300 font-bold mb-3">«На стыке миров: Разломный резонанс»</p>
              <p className="text-sm text-white/60 mb-6 leading-relaxed">
                Обновление 1.5 открывает путь в измерение Different Dimension: Хофманнита и CMH объединяют силы в новом крупном событии с историей, испытаниями и особой гачей. Также доступны три небольших события. Заберите 800 Камней Истока в честь обновления!
              </p>
              
              <div className="flex items-center gap-3 mb-8 bg-emerald-950/30 px-6 py-3 rounded-2xl border border-emerald-500/30">
                 <span className="text-2xl">💎</span>
                 <span className="text-2xl font-black text-emerald-300 font-mono tracking-widest">800</span>
              </div>
              
              <button 
                onClick={() => {
                  updateProfile(p => {
                    if (p.events?.update15Claimed) return p;
                    return ({
                      ...p, gems: p.gems + 800, events: { ...p.events, update15Claimed: true }
                    });
                  });
                }}
                disabled={profile.events?.update15Claimed}
                className={cn(
                  "w-full py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition cursor-pointer active:scale-95 shadow-lg", 
                  profile.events?.update15Claimed
                    ? "bg-white/5 text-white/30 border border-white/5 cursor-not-allowed" 
                    : "bg-gradient-to-r from-emerald-400 to-teal-500 text-black hover:from-emerald-300 hover:to-teal-400 shadow-emerald-950/50"
                )}
              >
                {profile.events?.update15Claimed ? "Получено" : "Получить 💎 800"}
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 8: LOGIN (7 DAYS)                                    */}
        {/* ======================================================== */}
        {subTab === 'LOGIN' && (
          <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-black text-indigo-400 uppercase tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Проект: Инициализация (7 Дней Входа)
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const isClaimed = loginStreak >= day;
                const isToday = loginStreak + 1 === day && !alreadyCheckedIn;
                return (
                  <div key={day} className={cn("aspect-square rounded-2xl border flex flex-col items-center justify-center p-2", isClaimed ? "bg-indigo-900/30 border-indigo-500/50" : isToday ? "bg-indigo-600 border-indigo-400 shadow-lg scale-105 z-10" : "bg-[#0a0a0a] border-white/5 opacity-50")}>
                    <span className={cn("text-[10px] font-bold mb-1", (isClaimed || isToday) ? "text-white" : "text-white/40")}>День {day}</span>
                    {isClaimed ? <CheckCircle2 className="w-5 h-5 text-indigo-400" /> : <Gift className={cn("w-5 h-5", isToday ? "text-white animate-pulse" : "text-white/20")} />}
                    <span className={cn("text-[10px] mt-1 font-mono font-bold", (isClaimed || isToday) ? "text-indigo-200" : "text-white/30")}>+160 💎</span>
                  </div>
                );
              })}
            </div>
            <button onClick={handleCheckIn} disabled={alreadyCheckedIn} className={cn("w-full py-4 rounded-2xl font-black uppercase text-sm flex justify-center gap-2", alreadyCheckedIn ? "bg-[#1a1a1a] text-white/30 border border-white/5" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg")}>
              {alreadyCheckedIn ? "Синхронизация завершена" : "Синхронизировать"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
