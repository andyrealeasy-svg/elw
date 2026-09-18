import React, { useState } from 'react';
import { PlayerProfile } from '../types';
import { 
  Utensils, ChefHat, Sparkles, Swords, Gift, CheckCircle2, 
  Play, Lock, Clock, Target, Crosshair, Award, Info, Maximize2, X, Eye
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getCharSplash } from '../data';
import { VKUSNO_COLLAB_ART } from '../lib/images';

interface Props {
  profile: PlayerProfile;
  updateProfile: (updater: (p: PlayerProfile) => PlayerProfile) => void;
  setRoute: (r: any) => void;
}

// Brand Logo Component of "Вкусно — и точка"
export const VkusnoLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <div className={cn("rounded-full bg-[#003c2f] flex items-center justify-center p-1.5 shadow-sm shrink-0 border border-[#005a46]", className)}>
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Burger circle */}
      <circle cx="28" cy="48" r="16" fill="#f35115" />
      {/* Fry 1 */}
      <rect x="52" y="24" width="13" height="52" rx="6.5" fill="#f59e0b" transform="rotate(-24 58 50)" />
      {/* Fry 2 */}
      <rect x="74" y="24" width="13" height="52" rx="6.5" fill="#f59e0b" transform="rotate(24 80 50)" />
    </svg>
  </div>
);

export default function VkusnoCollabEvent({ profile, updateProfile, setRoute }: Props) {
  const [activeTab, setActiveTab] = useState<'STORY' | 'KITCHEN' | 'TRIAL' | 'DAILY'>('STORY');
  const [showPosterModal, setShowPosterModal] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  // Daily combo claim status (Nerfed: 20 gems, 10k gold, +20 resin)
  const lastDailyClaim = profile.events?.vkusnoDailyClaimDate || "";
  const isDailyClaimed = lastDailyClaim === todayStr;

  const handleClaimDailyLunch = () => {
    if (isDailyClaimed) return;
    updateProfile(p => ({
      ...p,
      gems: p.gems + 20,
      gold: p.gold + 10000,
      resin: Math.min(240, (p.resin || 0) + 20),
      events: {
        ...(p.events || {}),
        vkusnoDailyClaimDate: todayStr
      }
    }));
  };

  // Story stages definition (Nerfed rewards: total 220 gems across all 5 chapters)
  const [activeDialogue, setActiveDialogue] = useState<{
    id: string;
    name: string;
    dialogue: { speaker: string; text: string; charId?: string }[];
    reward: { gems: number; gold: number };
  } | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);

  const storyStages = [
    {
      id: "vkusno_stage_1",
      name: "Брешь в меню",
      subtitle: "Аномальный аромат в секторе 4",
      description: "Сайрус и Рейвен расследуют открытие пространственного разлома, источающего аромат горячего бургера и картофеля.",
      type: "DIALOGUE" as const,
      level: 1,
      dialogue: [
        {
          speaker: "Сайрус",
          charId: "cyrus",
          text: "Рейвен, доложи обстановку в квадрате 4. Спектральные сканеры фиксируют мощный тепловой всплеск. Термодинамика аномалии не похожа на стандартный разлом пустоты."
        },
        {
          speaker: "Рейвен",
          charId: "raven",
          text: "Я уже на позиции, Сайрус. Источник — двухэтажное стеклянное здание с неоновой вывеской: две золотистые полосы картофеля и оранжевый бургер. Надпись гласит: «Вкусно — и точка»."
        },
        {
          speaker: "Сайрус",
          charId: "cyrus",
          text: "Оптический прицел фиксирует объект на раздаче... Это «Гранд Де Люкс». Геометрически безупречная котлета из натуральной говядины, сочные томаты, маринованные огурчики и тающий сыр чеддер. Угол наклона булочки с кунжутом — ровно 14 градусов. Поразительно."
        },
        {
          speaker: "Рейвен",
          charId: "raven",
          text: "Ты снова за своё со своими баллистическими расчетами, Сайрус? Признай, что просто хочешь есть. Я чувствую аромат соуса за полмили. Двигаемся в тени к входу!"
        }
      ],
      reward: { gems: 30, gold: 10000 }
    },
    {
      id: "vkusno_stage_2",
      name: "Оборона Автораздачи",
      subtitle: "Боевое столкновение",
      description: "Аномальные глитч-роботы пытаются захватить фургоны доставки и запасы хрустящей картошки фри!",
      type: "BATTLE" as const,
      level: 55,
      enemyBlueprintIds: ["glitch_slime", "glitch_robot", "glitch_slime"],
      isBoss: false,
      reward: { exp: 3000, gold: 15000, gems: 50 }
    },
    {
      id: "vkusno_stage_3",
      name: "Баллистика Вкуса",
      subtitle: "Секретная дегустация и гости",
      description: "Сайрус и Рейвен тестируют фирменные комбо, когда на кухню врываются Фарина и Блейз.",
      type: "DIALOGUE" as const,
      level: 1,
      dialogue: [
        {
          speaker: "Рейвен",
          charId: "raven",
          text: "Периметр чист. Вот твой сет: «Гранд Де Люкс», большая порция картофеля фри и сырный соус. А я взяла двойной «Биг Хит» и холодный чай."
        },
        {
          speaker: "Сайрус",
          charId: "cyrus",
          text: "*(делает укус)* Безупречно. Температура прожарки идеальна, баллистическая плотность соуса выверена до микрона. Коэффициент наслаждения: 10 из 10. Моя концентрация в прицеле выросла на сорок процентов."
        },
        {
          speaker: "Фарина",
          charId: "farina",
          text: "А-а-ай! Вы тут устроили секретный пир без меня?! Я почувствовала хрустящий пирожок с горячей вишней через три квартала! Если вы не дадите мне вишневый пирожок и карамельный «Айс Де Люкс», я заморожу весь ваш соус!"
        },
        {
          speaker: "Блейз",
          charId: "blaze",
          text: "Спокойно, я уже за грилем! Мое пиро-пламя поджаривает котлеты за полторы секунды!"
        },
        {
          speaker: "Сайрус",
          charId: "cyrus",
          text: "Блейз, отойди от жаровни немедленно! Ты превратишь мраморную говядину в пепел пустоты. На кухне «Вкусно — и точка» нужен строгий стандарт качества."
        },
        {
          speaker: "Рейвен",
          charId: "raven",
          text: "Фарина, держи свой пирожок, он только из печи. А теперь приготовьтесь — к нам приближается главный вредитель."
        }
      ],
      reward: { gems: 30, gold: 10000 }
    },
    {
      id: "vkusno_stage_4",
      name: "Шеф-Повар Матрицы",
      subtitle: "Битва с боссом аномалий",
      description: "Кибернетический Страж пытается стереть секретную рецептуру «Биг Хита» и заменить ее безвкусным машинным кодом!",
      type: "BATTLE" as const,
      level: 85,
      enemyBlueprintIds: ["matrix_guard"],
      isBoss: true,
      reward: { exp: 10000, gold: 25000, gems: 60 }
    },
    {
      id: "vkusno_stage_5",
      name: "Точка Поставлена",
      subtitle: "Триумф спецагентов",
      description: "Ресторан спасен, Сайрус и Рейвен становятся официальными амбассадорами комбо-наборов в Измерении.",
      type: "DIALOGUE" as const,
      level: 1,
      dialogue: [
        {
          speaker: "Рейвен",
          charId: "raven",
          text: "Страж Матрицы деактивирован. Рецептура «Биг Хита» и соусов в полной безопасности. Менеджмент «Вкусно — и точка» прислал нам официальную благодарность и золотой статус."
        },
        {
          speaker: "Сайрус",
          charId: "cyrus",
          text: "Операция завершена с абсолютным успехом. Теперь ресторан «Вкусно — и точка» признан стратегическим гастрономическим узлом Города Измерений. Цель поражена. Точка поставлена."
        },
        {
          speaker: "Фарина",
          charId: "farina",
          text: "Ура-а! А вишневые пирожки теперь будут давать каждый день! Сайрус, Рейвен — вы лучшие спецагенты во Вселенной!"
        }
      ],
      reward: { gems: 50, gold: 20000 }
    }
  ];

  // Kitchen mini-activity: 4 signature combos, prepared ONCE PER DAY each
  const combos = [
    {
      id: 'cyrus_grand',
      title: '«Снайперский Гранд» Сайруса',
      hero: 'Сайрус',
      charId: 'cyrus',
      badge: 'Выбор Снайпера',
      borderColor: 'border-amber-500/40',
      items: ['Гранд Де Люкс с сыром', 'Двойной Картофель Фри', 'Добрый Кола со льдом', 'Сырный Соус'],
      quote: '«Точный расчет слоев: хрустящий бекон, двойной чеддер и идеальная прожарка. Бьет точно в цель.»',
      points: 50,
      reward: { gems: 10, gold: 5000 }
    },
    {
      id: 'raven_bighit',
      title: '«Теневой Биг Хит» Рейвен',
      hero: 'Рейвен',
      charId: 'raven',
      badge: 'Выбор Ассасина',
      borderColor: 'border-purple-500/40',
      items: ['Биг Хит с двумя котлетами', 'Хрустящие Наггетсы (9 шт.)', 'Холодный Чай Лесные Ягоды', 'Кисло-сладкий соус'],
      quote: '«Скрытная доставка, мгновенный хруст наггетсов и неповторимый соус. Идеально для ночных операций.»',
      points: 50,
      reward: { gems: 10, gold: 5000 }
    },
    {
      id: 'farina_dessert',
      title: '«Крио-Десерт» Фарины',
      hero: 'Фарина',
      charId: 'farina',
      badge: 'Сладкая Радость',
      borderColor: 'border-cyan-500/40',
      items: ['Горячий Пирожок с вишней', 'Мороженое Айс Де Люкс Карамель', 'Ванильный Милкшейк'],
      quote: '«М-м-м! Горячая вишня и ледяной пломбир! Моя крио-магия становится в сто раз сильнее!»',
      points: 40,
      reward: { gems: 10, gold: 4000 }
    },
    {
      id: 'blaze_spicy',
      title: '«Огненный Двойной Чиз» Блейза',
      hero: 'Блейз',
      charId: 'blaze',
      badge: 'Острое Пламя',
      borderColor: 'border-red-500/40',
      items: ['Двойной Чизбургер Экстра', 'Картофель по-деревенски', 'Острый Стрипс', 'Барбекю Соус'],
      quote: '«Вот это настоящая прожарка! Пиро-перчик и сочнейший чеддер для подзарядки пламени!»',
      points: 40,
      reward: { gems: 10, gold: 4000 }
    }
  ];

  const kitchenPoints = (profile.events?.vkusnoKitchenPoints as number) || 0;
  const cookedCombos = (profile.events?.vkusnoCookedCombos as Record<string, number>) || {};
  const claimedMilestones = (profile.events?.vkusnoClaimedMilestones as number[]) || [];

  // Daily quota tracking: Reset if new day
  const todayCookDate = profile.events?.vkusnoCookDate || "";
  const isNewCookDay = todayCookDate !== todayStr;
  const cookedToday: Record<string, boolean> = isNewCookDay 
    ? {} 
    : (profile.events?.vkusnoCookedToday || {});

  const completedTodayCount = Object.keys(cookedToday).filter(k => cookedToday[k]).length;

  const [cookMessage, setCookMessage] = useState<string | null>(null);

  const handleCookCombo = (combo: typeof combos[0]) => {
    // Prevent infinite farming: only 1 preparation per combo per day
    if (cookedToday[combo.id]) return;

    const currentCount = cookedCombos[combo.id] || 0;
    const newCount = currentCount + 1;
    const newPoints = kitchenPoints + combo.points;

    updateProfile(p => {
      const prevCookDate = p.events?.vkusnoCookDate || "";
      const currentCookedToday = (prevCookDate === todayStr) ? (p.events?.vkusnoCookedToday || {}) : {};

      return {
        ...p,
        gems: p.gems + combo.reward.gems,
        gold: p.gold + combo.reward.gold,
        events: {
          ...(p.events || {}),
          vkusnoCookDate: todayStr,
          vkusnoCookedToday: {
            ...currentCookedToday,
            [combo.id]: true
          },
          vkusnoKitchenPoints: newPoints,
          vkusnoCookedCombos: {
            ...((p.events?.vkusnoCookedCombos as Record<string, number>) || {}),
            [combo.id]: newCount
          }
        }
      };
    });

    setCookMessage(`Заказ ${combo.title} подан! +${combo.points} Очков Вкуса (+${combo.reward.gems} 💎)`);
    setTimeout(() => setCookMessage(null), 3500);
  };

  // Milestones (Rebalanced/Nerfed)
  const milestones = [
    { target: 100, gems: 25, gold: 10000, label: 'Гурман-Новичок' },
    { target: 250, gems: 40, gold: 20000, label: 'Шеф-Ассистент' },
    { target: 500, gems: 60, gold: 30000, label: 'Мастер Комбо' },
    { target: 800, gems: 80, gold: 50000, label: 'Спецагент Вкуса' }
  ];

  const handleClaimMilestone = (target: number, rGems: number, rGold: number) => {
    if (claimedMilestones.includes(target) || kitchenPoints < target) return;
    updateProfile(p => ({
      ...p,
      gems: p.gems + rGems,
      gold: p.gold + rGold,
      events: {
        ...(p.events || {}),
        vkusnoClaimedMilestones: [...claimedMilestones, target]
      }
    }));
  };

  // Trial battle with Cyrus & Raven (Nerfed: 40 gems, 15k gold)
  const isTrialCompleted = (profile.events?.completedTestRuns || []).includes('test_vkusno_duo');

  const handleStartDuoTrial = () => {
    setRoute({
      type: 'TRIAL_BATTLE',
      trialId: 99,
      isTestRun: true,
      testId: 'test_vkusno_duo',
      team: ['cyrus', 'raven', 'farina', 'blaze'],
      title: '«Вкусно — и точка: Спецоперация Комбо»',
      rewardGems: isTrialCompleted ? 0 : 40,
      rewardGold: isTrialCompleted ? 0 : 15000
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* DIALOGUE MODAL */}
      {activeDialogue && (
        <div className="fixed inset-0 z-[100] bg-black/90 p-4 sm:p-8 flex flex-col justify-end animate-in fade-in">
          <div className="flex-1 flex items-center justify-center relative">
            {activeDialogue.dialogue?.[dialogueIndex]?.charId && (
              <img 
                src={getCharSplash(activeDialogue.dialogue[dialogueIndex].charId!)} 
                className="h-full max-h-[60vh] object-contain animate-in zoom-in-95 duration-200"
                alt="character"
                referrerPolicy="no-referrer"
              />
            )}
          </div>

          <div className="bg-[#0b1f18] border-2 border-[#005a46] rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto w-full relative">
            <div className="flex items-center gap-3 mb-3">
              <VkusnoLogo className="w-7 h-7" />
              <h4 className="text-xl font-black text-[#ff8042] uppercase tracking-wider">
                {activeDialogue.dialogue?.[dialogueIndex]?.speaker || "..."}
              </h4>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#003c2f] text-emerald-200 border border-[#005a46]">
                Коллаборация
              </span>
            </div>

            <p className="text-base sm:text-lg text-white/95 leading-relaxed font-sans min-h-[70px]">
              {activeDialogue.dialogue?.[dialogueIndex]?.text}
            </p>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10">
              <div className="text-xs font-mono text-white/40">
                Реплика {dialogueIndex + 1} из {activeDialogue.dialogue.length}
              </div>
              <button 
                onClick={() => {
                  if (dialogueIndex < activeDialogue.dialogue.length - 1) {
                    setDialogueIndex(prev => prev + 1);
                  } else {
                    updateProfile(p => ({
                      ...p,
                      gems: p.gems + activeDialogue.reward.gems,
                      gold: p.gold + activeDialogue.reward.gold,
                      storyProgress: {
                        ...p.storyProgress,
                        completedStages: [...(p.storyProgress?.completedStages || []), activeDialogue.id]
                      },
                      events: {
                        ...(p.events || {}),
                        vkusnoCompletedStages: [...(p.events?.vkusnoCompletedStages || []), activeDialogue.id]
                      }
                    }));
                    setActiveDialogue(null);
                  }
                }}
                className="px-8 py-3 bg-[#f35115] hover:bg-[#d84007] text-white font-black uppercase rounded-2xl tracking-widest transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {dialogueIndex < activeDialogue.dialogue.length - 1 ? (
                  <>Далее <Play className="w-4 h-4" /></>
                ) : (
                  <>Завершить и забрать 💎 {activeDialogue.reward.gems} <CheckCircle2 className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COLLABORATION POSTER ART MODAL */}
      {showPosterModal && (
        <div 
          className="fixed inset-0 z-[120] bg-black/95 p-4 sm:p-8 flex flex-col items-center justify-center animate-in fade-in"
          onClick={() => setShowPosterModal(false)}
        >
          <div 
            className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 text-white border-b border-white/10 mb-3">
              <div className="flex items-center gap-2.5">
                <VkusnoLogo className="w-7 h-7" />
                <div>
                  <span className="font-black text-sm uppercase tracking-wider text-emerald-300 block">
                    Официальный арт коллаборации
                  </span>
                  <span className="text-xs text-white/50">
                    «Вкусно — и точка» × Different Dimension
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowPosterModal(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border-2 border-[#005a46] bg-[#07130e] max-h-[78vh] flex items-center justify-center p-1">
              <img 
                src={VKUSNO_COLLAB_ART} 
                alt="Вкусно — и точка Коллаборация официальный арт" 
                className="max-h-[76vh] w-auto object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}

      {/* HERO BANNER (Solid colors, no gradients) */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-[#005a46] bg-[#091812]">
        {/* Official Collaboration Art Background Display */}
        <div 
          onClick={() => setShowPosterModal(true)}
          className="absolute right-0 bottom-0 top-0 w-full sm:w-1/2 lg:w-3/5 flex items-end justify-end cursor-pointer group overflow-hidden"
          title="Нажмите, чтобы открыть полный арт коллаборации"
        >
          <img 
            src={VKUSNO_COLLAB_ART} 
            alt="Вкусно — и точка Коллаборация арт" 
            className="h-full w-full object-cover sm:object-contain object-right-bottom opacity-75 sm:opacity-90 group-hover:opacity-100 transition-opacity duration-300"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-3 right-3 bg-[#003c2f] text-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-xl border border-[#005a46] opacity-90 group-hover:opacity-100 transition-all flex items-center gap-1.5 shadow-md">
            <Eye className="w-3 h-3 text-[#f59e0b]" /> Полноразмерный арт
          </div>
        </div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-between min-h-[270px] max-w-xl pointer-events-auto">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <VkusnoLogo className="w-10 h-10" />
              <div className="flex items-center gap-2 bg-[#003c2f] border border-[#005a46] px-3 py-1 rounded-full text-xs font-bold text-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
                Официальная Коллаборация
              </div>
              <div className="bg-[#f35115] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Сайрус & Рейвен
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight leading-none">
              Вкусно — и точка <span className="text-[#f35115]">×</span> Different Dimension
            </h1>
            <p className="text-sm font-black text-[#f59e0b] uppercase tracking-widest mt-1">
              Операция «Комбо-Перехват»
            </p>
            <p className="text-xs sm:text-sm text-white/70 max-w-md sm:max-w-lg mt-3 leading-relaxed">
              В Измерении открылся легендарный ресторан! Спецагенты <b className="text-white">Сайрус</b> и <b className="text-white">Рейвен</b> берут под прицел меню, защищают автораздачу от аномалий и готовят фирменные комбо-наборы.
            </p>
          </div>

          {/* Highlights & Daily lunch shortcut */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Событие активно • Доступны все этапы
            </div>

            <button
              onClick={handleClaimDailyLunch}
              disabled={isDailyClaimed}
              className={cn(
                "px-5 py-2.5 rounded-2xl font-black uppercase text-xs tracking-wider flex items-center gap-2 transition cursor-pointer",
                isDailyClaimed 
                  ? "bg-[#14231d] text-emerald-400/50 border border-emerald-800/30" 
                  : "bg-[#f35115] hover:bg-[#d84007] text-white active:scale-95"
              )}
            >
              <Gift className="w-4 h-4" />
              {isDailyClaimed ? "Обед агента получен ✓" : "Забрать Обед Агента (💎20, 🪙10k)"}
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION (Solid buttons, no gradients) */}
      <div className="flex items-center gap-2 bg-[#0a120e] p-1.5 rounded-2xl border border-white/10 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('STORY')}
          className={cn(
            "px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 transition cursor-pointer",
            activeTab === 'STORY'
              ? "bg-[#003c2f] text-emerald-200 border border-[#005a46]"
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          <Utensils className="w-4 h-4 text-[#f35115]" />
          Сюжет: Спецзаказ
        </button>

        <button
          onClick={() => setActiveTab('KITCHEN')}
          className={cn(
            "px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 transition cursor-pointer",
            activeTab === 'KITCHEN'
              ? "bg-[#003c2f] text-emerald-200 border border-[#005a46]"
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          <ChefHat className="w-4 h-4 text-[#f59e0b]" />
          Кухня Комбо ({completedTodayCount}/4 сегодня)
        </button>

        <button
          onClick={() => setActiveTab('TRIAL')}
          className={cn(
            "px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 transition cursor-pointer",
            activeTab === 'TRIAL'
              ? "bg-[#003c2f] text-emerald-200 border border-[#005a46]"
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          <Swords className="w-4 h-4 text-purple-400" />
          Дуэт Спецагентов
        </button>

        <button
          onClick={() => setActiveTab('DAILY')}
          className={cn(
            "px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 transition cursor-pointer",
            activeTab === 'DAILY'
              ? "bg-[#003c2f] text-emerald-200 border border-[#005a46]"
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          <Gift className="w-4 h-4 text-[#f35115]" />
          Ежедневные Подарки
        </button>
      </div>

      {/* TAB 1: STORY STAGES */}
      {activeTab === 'STORY' && (
        <div className="space-y-4">
          <div className="bg-[#0b1612] border border-[#005a46] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div 
                onClick={() => setShowPosterModal(true)}
                className="w-16 h-12 rounded-xl overflow-hidden border-2 border-[#005a46] bg-black cursor-pointer group shrink-0 relative"
                title="Нажмите, чтобы открыть полный арт"
              >
                <img 
                  src={VKUSNO_COLLAB_ART} 
                  alt="Промо-арт" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors flex items-center justify-center">
                  <Eye className="w-3.5 h-3.5 text-white drop-shadow" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Сюжетная линия: «Операция Спецзаказ»
                </h3>
                <p className="text-xs text-white/50">
                  Пройдите 5 глав с Сайрусом и Рейвен, спасите ресторан от кибер-боссов и получите награды.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#f59e0b] bg-black/50 px-3 py-1.5 rounded-xl border border-white/5 shrink-0">
              <span>💎 220 Гемов за сюжет</span>
            </div>
          </div>

          <div className="space-y-3">
            {storyStages.map((stage, idx) => {
              const isCompleted = profile.storyProgress?.completedStages.includes(stage.id) 
                || (profile.events?.vkusnoCompletedStages || []).includes(stage.id);
              const prevCompleted = idx === 0 ? true : (
                profile.storyProgress?.completedStages.includes(storyStages[idx - 1].id) 
                || (profile.events?.vkusnoCompletedStages || []).includes(storyStages[idx - 1].id)
              );
              const isUnlocked = prevCompleted;

              return (
                <div
                  key={stage.id}
                  className={cn(
                    "p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
                    isCompleted
                      ? "bg-black/50 border-emerald-950 opacity-75"
                      : isUnlocked
                      ? "bg-[#0e1f17] border-emerald-600/50 hover:border-emerald-500"
                      : "bg-[#0b100d] border-white/5 opacity-50"
                  )}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-emerald-300 bg-[#003c2f] px-2 py-0.5 rounded border border-[#005a46]">
                        Глава {idx + 1}
                      </span>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                        stage.type === 'BATTLE' 
                          ? (stage.isBoss ? "bg-red-950 text-red-300 border border-red-800" : "bg-orange-950 text-orange-300 border border-orange-800") 
                          : "bg-[#003c2f] text-emerald-300 border border-[#005a46]"
                      )}>
                        {stage.type === 'BATTLE' ? (stage.isBoss ? 'Босс-Битва' : 'Битва') : 'Сюжетный Диалог'}
                      </span>
                      {stage.level > 1 && (
                        <span className="text-[10px] font-mono text-white/40">
                          Ур. {stage.level}
                        </span>
                      )}
                      <h4 className="text-base font-bold text-white">
                        {stage.name}
                      </h4>
                    </div>
                    <p className="text-xs text-white/60">
                      {isUnlocked ? stage.description : "Завершите предыдущую главу..."}
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end justify-center shrink-0 space-y-2.5 w-full sm:w-auto">
                    <div className="flex items-center gap-3 font-mono text-xs font-bold bg-black/60 px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="text-indigo-300">💎 {stage.reward.gems}</span>
                      <span className="text-amber-400">🪙 {stage.reward.gold.toLocaleString()}</span>
                    </div>

                    {isCompleted ? (
                      <button className="w-full sm:w-auto px-6 py-2 bg-[#0d1c16] text-emerald-400/60 border border-emerald-900 rounded-xl text-xs uppercase font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Пройдено
                      </button>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => {
                          if (stage.type === 'DIALOGUE') {
                            setActiveDialogue(stage);
                            setDialogueIndex(0);
                          } else {
                            setRoute({ type: 'STORY_STAGE', stage });
                          }
                        }}
                        className="w-full sm:w-auto px-8 py-2 bg-[#f35115] hover:bg-[#d84007] text-white rounded-xl text-xs uppercase font-black tracking-wider transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Play className="w-4 h-4" /> Начать
                      </button>
                    ) : (
                      <button disabled className="w-full sm:w-auto px-6 py-2 bg-[#121614] text-white/30 rounded-xl text-xs uppercase font-bold flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4" /> Закрыто
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: KITCHEN COMBO SYSTEM (Once per day per combo, no gradients) */}
      {activeTab === 'KITCHEN' && (
        <div className="space-y-6">
          {/* Points & Milestones Bar */}
          <div className="bg-[#091812] border-2 border-[#005a46] rounded-3xl p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#f59e0b] uppercase tracking-wider mb-1">
                  <ChefHat className="w-4 h-4" /> Фирменная Кухня «Вкусно — и точка»
                </div>
                <h3 className="text-2xl font-black text-white">
                  Очки Вкуса: <span className="text-[#f59e0b]">{kitchenPoints}</span>
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-white/70">
                    Подача заказов доступна <b>1 раз в день</b> для каждого персонажа.
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-300 bg-[#003c2f] px-2 py-0.5 rounded border border-[#005a46]">
                    Сегодня: {completedTodayCount} / {combos.length}
                  </span>
                </div>
              </div>

              {cookMessage && (
                <div className="bg-[#f35115] text-white px-4 py-2 rounded-xl text-xs font-black animate-in zoom-in-95 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {cookMessage}
                </div>
              )}
            </div>

            {/* Milestones Road */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-white/60 mb-1">
                <span>Прогресс Шефа</span>
                <span>{kitchenPoints} / 800</span>
              </div>
              <div className="h-3 w-full bg-black/70 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div 
                  className="h-full bg-[#f35115] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (kitchenPoints / 800) * 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                {milestones.map((m) => {
                  const isClaimed = claimedMilestones.includes(m.target);
                  const isReady = kitchenPoints >= m.target && !isClaimed;

                  return (
                    <div 
                      key={m.target}
                      className={cn(
                        "p-3 rounded-xl border text-center flex flex-col justify-between",
                        isClaimed 
                          ? "bg-[#0e2119] border-emerald-900 text-emerald-400" 
                          : isReady 
                          ? "bg-[#2b160e] border-[#f35115] text-white" 
                          : "bg-black/40 border-white/5 text-white/50"
                      )}
                    >
                      <div className="text-[10px] font-mono font-bold">{m.target} Очков</div>
                      <div className="text-xs font-bold my-1 text-amber-300">💎 {m.gems}</div>
                      <div className="text-[10px] opacity-75">{m.label}</div>
                      <button
                        onClick={() => handleClaimMilestone(m.target, m.gems, m.gold)}
                        disabled={!isReady}
                        className={cn(
                          "mt-2 w-full py-1 rounded-lg text-[10px] font-black uppercase transition cursor-pointer",
                          isClaimed 
                            ? "bg-white/5 text-white/30" 
                            : isReady 
                            ? "bg-[#f35115] hover:bg-[#d84007] text-white" 
                            : "bg-white/5 text-white/20"
                        )}
                      >
                        {isClaimed ? "Забрано" : isReady ? "Забрать" : "В процессе"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Combos Grid (Solid cards, no gradients) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {combos.map((c) => {
              const totalCount = cookedCombos[c.id] || 0;
              const isCookedToday = !!cookedToday[c.id];
              const splash = getCharSplash(c.charId);

              return (
                <div
                  key={c.id}
                  className={cn(
                    "p-5 rounded-3xl border bg-[#0b1612] transition-all relative flex flex-col justify-between",
                    c.borderColor
                  )}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-[#f59e0b] border border-[#f59e0b]/30">
                          {c.badge}
                        </span>
                        {isCookedToday && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-[#003c2f] px-2 py-0.5 rounded-full border border-[#005a46]">
                            Подано сегодня ✓
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-black text-white mt-1.5">{c.title}</h4>
                      <p className="text-xs text-white/50">{c.hero} в восторге от этого сета</p>
                    </div>

                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/20 bg-black shrink-0">
                      <img 
                        src={splash} 
                        alt={c.hero} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  {/* Menu items inside combo */}
                  <div className="space-y-1.5 my-3 bg-black/50 p-3 rounded-2xl border border-white/5">
                    <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1">
                      Состав набора:
                    </div>
                    {c.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-white/90">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs italic text-white/70 mb-4 bg-[#07130e] p-2.5 rounded-xl border border-emerald-900/30">
                    {c.quote}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="text-xs font-mono">
                      <span className="text-emerald-300 font-bold">+{c.points} Очков</span>
                      <span className="text-white/40 ml-2">(Всего: {totalCount})</span>
                    </div>

                    <button
                      onClick={() => handleCookCombo(c)}
                      disabled={isCookedToday}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5",
                        isCookedToday
                          ? "bg-[#141e19] text-white/40 border border-white/5 cursor-not-allowed"
                          : "bg-[#f35115] hover:bg-[#d84007] text-white cursor-pointer active:scale-95"
                      )}
                    >
                      <ChefHat className="w-3.5 h-3.5" />
                      {isCookedToday ? "Подано сегодня" : `Подать заказ (+${c.reward.gems}💎)`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: AGENTS TRIAL BATTLE (Solid colors, no gradients) */}
      {activeTab === 'TRIAL' && (
        <div className="space-y-6">
          <div className="rounded-3xl border-2 border-purple-800/40 bg-[#110f1c] p-6 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2 text-xs font-black text-purple-300 uppercase tracking-wider">
                  <Swords className="w-4 h-4" /> Тестовое Боевое Испытание
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Спецоперация: Комбо-Дуэт
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  Испытайте дуэт <b className="text-[#ff8042]">Сайруса</b> и <b className="text-purple-300">Рейвен</b> в специальной симуляции! Снайперская метка Сайруса и мгновенные клинки Рейвен при поддержке Фарины и Блейза уверенно побеждают противников.
                </p>

                <div className="flex items-center gap-4 text-xs font-mono font-bold pt-2">
                  <span className="text-purple-300 bg-purple-950 px-3 py-1 rounded-lg border border-purple-800">
                    Уровень отряда: 80
                  </span>
                  <span className={cn(
                    "px-3 py-1 rounded-lg border",
                    isTrialCompleted 
                      ? "text-emerald-400 bg-[#003c2f] border-[#005a46]" 
                      : "text-amber-300 bg-[#291e0a] border-amber-800"
                  )}>
                    {isTrialCompleted ? "Награда получена" : "💎 40 Гемов + 🪙 15,000"}
                  </span>
                </div>
              </div>

              {/* Team avatars preview */}
              <div className="flex flex-col items-center gap-3 bg-black/60 p-4 rounded-2xl border border-white/10 shrink-0">
                <div className="text-[11px] font-bold text-white/60 uppercase">Состав отряда:</div>
                <div className="flex gap-2">
                  {['cyrus', 'raven', 'farina', 'blaze'].map((id) => (
                    <div key={id} className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/20 bg-[#111] relative group">
                      <img 
                        src={getCharSplash(id)} 
                        alt={id} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleStartDuoTrial}
                  className="mt-2 w-full py-3 bg-[#f35115] hover:bg-[#d84007] text-white rounded-xl text-xs font-black uppercase tracking-widest transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                >
                  <Swords className="w-4 h-4" />
                  {isTrialCompleted ? "Повторить бой" : "Начать испытание"}
                </button>
              </div>
            </div>
          </div>

          {/* Character showcase cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#091712] border border-[#005a46] rounded-3xl p-5 flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#f35115] shrink-0">
                <img src={getCharSplash('cyrus')} alt="Cyrus" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-black text-[#ff8042] uppercase">Главное лицо ивента</div>
                <h4 className="text-lg font-black text-white">Сайрус (Cyrus)</h4>
                <p className="text-xs text-white/60">
                  Метка «Дуэли» изолирует цель, игнорируя сопротивление. В комбо-сете «Снайперский Гранд» получает максимальную точность.
                </p>
              </div>
            </div>

            <div className="bg-[#091712] border border-[#005a46] rounded-3xl p-5 flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-purple-500 shrink-0">
                <img src={getCharSplash('raven')} alt="Raven" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-black text-purple-300 uppercase">Главное лицо ивента</div>
                <h4 className="text-lg font-black text-white">Рейвен (Raven)</h4>
                <p className="text-xs text-white/60">
                  Теневой ассасин сверхбыстрого темпа. Наносит молниеносный урон серией атак в сете «Теневой Биг Хит».
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DAILY REWARDS (Solid colors, no gradients) */}
      {activeTab === 'DAILY' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="bg-[#091812] border-2 border-[#005a46] rounded-3xl p-6 sm:p-8 text-center space-y-4">
            <VkusnoLogo className="w-16 h-16 mx-auto" />

            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                Обед Спецагента «Вкусно — и точка»
              </h3>
              <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto mt-1">
                Каждый день заходите в игру во время действия коллаборации и получайте фирменный ланч-бокс с ресурсами!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto py-2">
              <div className="bg-black/50 p-3 rounded-2xl border border-white/10 flex flex-col items-center">
                <span className="text-xl">💎</span>
                <span className="text-base font-black text-indigo-300 mt-1">20</span>
                <span className="text-[10px] text-white/40 uppercase">Гемы</span>
              </div>
              <div className="bg-black/50 p-3 rounded-2xl border border-white/10 flex flex-col items-center">
                <span className="text-xl">🪙</span>
                <span className="text-base font-black text-amber-400 mt-1">10,000</span>
                <span className="text-[10px] text-white/40 uppercase">Золото</span>
              </div>
              <div className="bg-black/50 p-3 rounded-2xl border border-white/10 flex flex-col items-center">
                <span className="text-xl">⚡</span>
                <span className="text-base font-black text-cyan-300 mt-1">+20</span>
                <span className="text-[10px] text-white/40 uppercase">Смола</span>
              </div>
            </div>

            <button
              onClick={handleClaimDailyLunch}
              disabled={isDailyClaimed}
              className={cn(
                "w-full py-4 rounded-2xl font-black uppercase text-sm tracking-wider transition cursor-pointer",
                isDailyClaimed
                  ? "bg-[#14231d] text-emerald-400/50 border border-emerald-800/30"
                  : "bg-[#f35115] hover:bg-[#d84007] text-white active:scale-95"
              )}
            >
              {isDailyClaimed ? "Сегодняшний обед уже получен ✓" : "Получить Обед Спецагента 🍔"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
