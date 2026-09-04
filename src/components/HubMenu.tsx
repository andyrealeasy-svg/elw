import React, { useState, useEffect } from 'react';
import { Joyride, Step, EventData, STATUS } from 'react-joyride';
import { PlayerProfile, GameRoute } from '../types';
import { Gem, Zap, Swords, Compass, Star, CheckCircle, Info, Users, Gift, Calendar, Map, Menu, X, Layers, Trophy, Book, Globe, Skull, HelpCircle } from 'lucide-react';
import { characterBlueprints, charRarity, getCharEmoji, getCharSplash } from '../data';
import EventsMenu from './EventsMenu';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Ticket, Loader2 } from 'lucide-react';

interface Props {
  profile: PlayerProfile;
  setRoute: (r: GameRoute | { type: 'DUNGEON', level: number, dungeonType: 'GOLD' | 'EXP' | 'ARTIFACT', runs?: number }) => void;
  updateProfile: (updater: (p: PlayerProfile) => PlayerProfile) => void;
  onLogout?: () => void;
  username?: string;
}

export default function HubMenu({ profile, setRoute, updateProfile, onLogout, username }: Props) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('tutorial_completed_v4')) {
      setShowTutorial(true);
      if (window.innerWidth < 768) {
        setMenuOpen(true);
      }
    }
  }, []);

  const startTutorialManually = () => {
    setActiveTab('OVERVIEW');
    if (window.innerWidth < 768) {
      setMenuOpen(true);
    }
    setShowTutorial(true);
  };

  const navigateFromTutorial = (
    routeTarget: GameRoute | { type: 'DUNGEON', level: number, dungeonType: 'GOLD' | 'EXP' | 'ARTIFACT', runs?: number } | null, 
    tabTarget?: 'OVERVIEW' | 'DAILIES' | 'DUNGEONS' | 'ACHIEVEMENTS' | 'SHOP' | 'EVENTS' | 'EXPEDITIONS'
  ) => {
    localStorage.setItem('tutorial_completed_v4', 'true');
    setShowTutorial(false);
    setMenuOpen(false);
    updateProfile(p => ({ ...p, tutorialCompleted: true }));
    if (routeTarget) {
      setRoute(routeTarget);
    } else if (tabTarget) {
      setActiveTab(tabTarget);
    }
  };

  const prefix = isMobile ? '.mob-' : '.desk-';
    const tutorialSteps: Step[] = [
    {
      target: prefix + 'tutorial-story',
      title: '📖 Сюжетная линия',
      content: (
        <div className="space-y-2.5">
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Главная сюжетная кампания. Проходите главы и сражения, чтобы раскрыть тайны мира и получить ценные самоцветы и ресурсы.
          </p>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <span className="text-[11px] text-amber-300 font-medium">💡 Хотите начать прямо сейчас?</span>
            <button
              onClick={() => navigateFromTutorial('STORY')}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition active:scale-95 whitespace-nowrap cursor-pointer shadow"
            >
              В Сюжет →
            </button>
          </div>
        </div>
      ),
      skipBeacon: true,
      placement: isMobile ? 'bottom' : 'right'
    },
    {
      target: prefix + 'tutorial-map',
      title: '🌍 Карта мира',
      content: (
        <div className="space-y-2.5">
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Интерактивная карта со свободным исследованием территорий, тайниками, сундуками и региональными боссами.
          </p>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <span className="text-[11px] text-indigo-300 font-medium">💡 Исследовать локации?</span>
            <button
              onClick={() => navigateFromTutorial('MAP')}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition active:scale-95 whitespace-nowrap cursor-pointer shadow"
            >
              На Карту →
            </button>
          </div>
        </div>
      ),
      skipBeacon: true,
      placement: isMobile ? 'bottom' : 'right'
    },
    {
      target: prefix + 'tutorial-dungeons',
      title: '⚔️ Подземелья фарма',
      content: (
        <div className="space-y-2.5">
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Специальные испытания за Смолу для быстрого накопления Золота Моры, Опыта Героев и редких Сетов Артефактов.
          </p>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <span className="text-[11px] text-blue-300 font-medium">💡 Перейти к фарму ресурсов?</span>
            <button
              onClick={() => navigateFromTutorial(null, 'DUNGEONS')}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition active:scale-95 whitespace-nowrap cursor-pointer shadow"
            >
              В Подземелья →
            </button>
          </div>
        </div>
      ),
      skipBeacon: true,
      placement: isMobile ? 'bottom' : 'right'
    },
    {
      target: prefix + 'tutorial-meta',
      title: '📊 Мета-гайд',
      content: (
        <div className="space-y-2.5">
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Гайд по синергиям стихий, тир-лист персонажей и рекомендации по эффективным сборкам от топовых игроков.
          </p>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <span className="text-[11px] text-yellow-300 font-medium">💡 Изучить советы по героям?</span>
            <button
              onClick={() => navigateFromTutorial('META')}
              className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold rounded-lg transition active:scale-95 whitespace-nowrap cursor-pointer shadow"
            >
              В Мета-гайд →
            </button>
          </div>
        </div>
      ),
      skipBeacon: true,
      placement: isMobile ? 'bottom' : 'right'
    },
    {
      target: prefix + 'tutorial-dailies',
      title: '📋 Поручения',
      content: (
        <div className="space-y-2.5">
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Выполняйте 4 ежедневных поручения каждый день. За полный список вы гарантированно забираете 60 Нефритов и ценный опыт!
          </p>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <span className="text-[11px] text-green-300 font-medium">💡 Хотите выполнить поручения?</span>
            <button
              onClick={() => navigateFromTutorial(null, 'DAILIES')}
              className="px-2.5 py-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition active:scale-95 whitespace-nowrap cursor-pointer shadow"
            >
              К Поручениям →
            </button>
          </div>
        </div>
      ),
      skipBeacon: true,
      placement: isMobile ? 'bottom' : 'right'
    },
    {
      target: prefix + 'tutorial-expeditions',
      title: '🧭 Экспедиции',
      content: (
        <div className="space-y-2.5">
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Отправляйте свободных героев на авто-миссии. Они приносят пассивный доход золота и материалов, пока вы отдыхаете.
          </p>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <span className="text-[11px] text-orange-300 font-medium">💡 Отправить героев в поход?</span>
            <button
              onClick={() => navigateFromTutorial(null, 'EXPEDITIONS')}
              className="px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg transition active:scale-95 whitespace-nowrap cursor-pointer shadow"
            >
              В Экспедиции →
            </button>
          </div>
        </div>
      ),
      skipBeacon: true,
      placement: isMobile ? 'bottom' : 'right'
    },
    {
      target: prefix + 'tutorial-events',
      title: '🎉 Временные события',
      content: (
        <div className="space-y-2.5">
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Участвуйте во временных событиях, фестивалях и забирайте ежедневные бонусы за вход в игру. Раздел обновляется регулярно!
          </p>
          <div className="pt-1.5 text-[11px] text-purple-300/80 italic">
            ℹ️ События меняются циклически — переходить сейчас не обязательно, продолжаем обучение.
          </div>
        </div>
      ),
      skipBeacon: true,
      placement: isMobile ? 'bottom' : 'right'
    },
    {
      target: prefix + 'tutorial-achievements',
      title: '⭐ Достижения',
      content: (
        <div className="space-y-2.5">
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Отслеживайте свои боевые и прогресс-триумфы. За каждое выполненное достижение начисляются дополнительные Камни Истока.
          </p>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <span className="text-[11px] text-yellow-300 font-medium">💡 Проверить свои награды?</span>
            <button
              onClick={() => navigateFromTutorial(null, 'ACHIEVEMENTS')}
              className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold rounded-lg transition active:scale-95 whitespace-nowrap cursor-pointer shadow"
            >
              В Достижения →
            </button>
          </div>
        </div>
      ),
      skipBeacon: true,
      placement: isMobile ? 'bottom' : 'right'
    },
    {
      target: prefix + 'tutorial-shop',
      title: '🎁 Магазин обмена',
      content: (
        <div className="space-y-2.5">
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Обменивайте пыль судьбы, звёздный блеск и мору на молитвенные крутки, материалы возвышения и редкие предметы.
          </p>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <span className="text-[11px] text-pink-300 font-medium">💡 Заглянуть в витрину товаров?</span>
            <button
              onClick={() => navigateFromTutorial(null, 'SHOP')}
              className="px-2.5 py-1 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-lg transition active:scale-95 whitespace-nowrap cursor-pointer shadow"
            >
              В Магазин →
            </button>
          </div>
        </div>
      ),
      skipBeacon: true,
      placement: isMobile ? 'bottom' : 'right'
    },
    {
      target: prefix + 'tutorial-roster',
      title: '👥 Отряд и персонажи',
      content: (
        <div className="space-y-2.5">
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Управляйте своими героями, прокачивайте уровни, возвышайте таланты и собирайте мощные сеты артефактов.
          </p>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <span className="text-[11px] text-indigo-300 font-medium">💡 Настроить отряд прямо сейчас?</span>
            <button
              onClick={() => navigateFromTutorial('ROSTER')}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition active:scale-95 whitespace-nowrap cursor-pointer shadow"
            >
              Открыть Отряд →
            </button>
          </div>
        </div>
      ),
      skipBeacon: true,
      placement: isMobile ? 'top' : 'right'
    },
    {
      target: prefix + 'tutorial-gacha',
      title: '✨ Молитвы (Гача)',
      content: (
        <div className="space-y-2.5">
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Испытайте удачу! Призывайте новых легендарных героев S-ранга и расширяйте свой боевой арсенал.
          </p>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <span className="text-[11px] text-yellow-300 font-medium">💡 Сделать призыв персонажей?</span>
            <button
              onClick={() => navigateFromTutorial('GACHA')}
              className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold rounded-lg transition active:scale-95 whitespace-nowrap cursor-pointer shadow"
            >
              В Молитвы →
            </button>
          </div>
        </div>
      ),
      skipBeacon: true,
      placement: isMobile ? 'top' : 'right'
    },
    {
      target: prefix + 'tutorial-bp',
      title: '🏆 Бравл Пасс',
      content: (
        <div className="space-y-2.5">
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Сезонный боевой пропуск: прокачивайте боевой ранг за активность и забирайте крутки, золото и эксклюзивные сундуки.
          </p>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <span className="text-[11px] text-emerald-300 font-medium">💡 Проверить награды пропуска?</span>
            <button
              onClick={() => navigateFromTutorial('BP')}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition active:scale-95 whitespace-nowrap cursor-pointer shadow"
            >
              В Бравл Пасс →
            </button>
          </div>
        </div>
      ),
      skipBeacon: true,
      placement: isMobile ? 'top' : 'right'
    },
    {
      target: prefix + 'tutorial-abyss',
      title: '🌀 Витая Бездна',
      content: (
        <div className="space-y-2.5">
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Поэтажные волны сильнейших врагов. Проверьте силу своей команды на глубоких этажах и заберите редчайшие награды!
          </p>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <span className="text-[11px] text-purple-300 font-medium">💡 Бросить вызов Бездне?</span>
            <button
              onClick={() => navigateFromTutorial('ABYSS')}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition active:scale-95 whitespace-nowrap cursor-pointer shadow"
            >
              Войти в Бездну →
            </button>
          </div>
        </div>
      ),
      skipBeacon: true,
      placement: isMobile ? 'top' : 'right'
    },
    {
      target: prefix + 'tutorial-bossrush',
      title: '💀 Теневой Натиск',
      content: (
        <div className="space-y-2.5">
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Эндгейм-режим повышенной сложности: соберите 3 уникальных отряда без повторения героев и одолейте 3 мега-боссов подряд!
          </p>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <span className="text-[11px] text-fuchsia-300 font-medium">💡 Сразиться с Мега-Боссами?</span>
            <button
              onClick={() => navigateFromTutorial('BOSS_RUSH_MENU')}
              className="px-2.5 py-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold rounded-lg transition active:scale-95 whitespace-nowrap cursor-pointer shadow"
            >
              В Натиск →
            </button>
          </div>
        </div>
      ),
      skipBeacon: true,
      placement: isMobile ? 'bottom' : 'right'
    }
  ];


    const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem('tutorial_completed_v4', 'true');
      setShowTutorial(false);
      updateProfile(p => ({ ...p, tutorialCompleted: true }));
    }
  };

  
  
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DAILIES' | 'DUNGEONS' | 'ACHIEVEMENTS' | 'SHOP' | 'EVENTS' | 'EXPEDITIONS'>('OVERVIEW');
  const [menuOpen, setMenuOpen] = useState(false);
  const [goldExpRuns, setGoldExpRuns] = useState<Record<string, number>>({ GOLD: 1, EXP: 1 });

  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handlePromoSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoMessage(null);

    const code = promoCode.trim().toUpperCase();

    if (profile.claimedPromos?.includes(code)) {
      setPromoMessage({ type: 'error', text: 'Промокод уже использован!' });
      setPromoLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code)
        .single();
      
      if (error || !data) {
        setPromoMessage({ type: 'error', text: 'Промокод не найден' });
        setPromoLoading(false);
        return;
      }

      if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
        setPromoMessage({ type: 'error', text: 'Срок действия истёк' });
        setPromoLoading(false);
        return;
      }

      // Claim success! Apply rewards
      updateProfile(p => {
        const next = { ...p };
        if (data.gems) next.gems += data.gems;
        if (data.gold) next.gold += data.gold;
        if (data.resin) next.resin += data.resin;
        if (data.heroExp) next.heroExp += data.heroExp;
        
        if (data.characters && Array.isArray(data.characters)) {
           const newRoster = { ...next.roster };
           data.characters.forEach((charId: string) => {
              if (characterBlueprints[charId]) {
                 if (!newRoster[charId]) {
                    newRoster[charId] = { level: 1, constellation: 0 };
                 } else {
                    newRoster[charId].constellation += 1;
                 }
              }
           });
           next.roster = newRoster;
        }

        // Apply any extra jsonb rewards if needed
        if (data.other_rewards) {
           const r = data.other_rewards;
           if (r.gems) next.gems += r.gems;
           if (r.gold) next.gold += r.gold;
        }
        
        next.claimedPromos = [...(p.claimedPromos || []), code];
        return next;
      });

      let rewardText = [];
      if (data.gems) rewardText.push(`${data.gems} Гемов`);
      if (data.gold) rewardText.push(`${data.gold} Золота`);
      if (data.resin) rewardText.push(`${data.resin} Смолы`);
      if (data.heroExp) rewardText.push(`${data.heroExp} Книг опыта`);
      if (data.characters && Array.isArray(data.characters)) rewardText.push(`Персонажей: ${data.characters.length}`);
      if (rewardText.length === 0) rewardText.push('Секретная награда');

      setPromoMessage({ type: 'success', text: `Успешно! Получено: ${rewardText.join(', ')}` });
      setPromoCode('');
    } catch (e) {
      console.error(e);
      setPromoMessage({ type: 'error', text: 'Ошибка сети.' });
    } finally {
      setPromoLoading(false);
    }
  };


  // Daily Tasks Data
  const DAILIES = [
    { id: 0, title: "Путь воина", desc: "Одержать 1 победу в подземелье", target: 1, current: profile.dailies.battlesWon, rewardGems: 40, rewardBp: 25000 },
    { id: 1, title: "Искусство боя", desc: "Использовать 5 навыков", target: 5, current: profile.dailies.skillsUsed, rewardGems: 20, rewardBp: 15000 },
    { id: 2, title: "Зов судьбы", desc: "Сделать 1 молитву (Гача)", target: 1, current: profile.dailies.gachaPulls, rewardGems: 20, rewardBp: 10000 },
    { id: 3, title: "Цена силы", desc: "Потратить 20 смолы", target: 20, current: profile.dailies.resinsSpent, rewardGems: 30, rewardBp: 30000 },
    { id: 4, title: "Покупки", desc: "Совершить покупку в магазине обмена", target: 1, current: profile.dailies.itemsBought, rewardGems: 10, rewardBp: 20000 },
  ];

  const claimDaily = (id: number, rewardGems: number, rewardBp: number) => {
    updateProfile(p => {
       if (p.dailies.claimed[id]) return p;
       let next = {...p, gems: p.gems + rewardGems, bpExp: p.bpExp + rewardBp, dailies: {...p.dailies}};
       next.dailies.claimed = [...p.dailies.claimed];
       next.dailies.claimed[id] = true;
       return next;
    });
  };

  const ACHIEVEMENTS = [
    { id: "first_steps", title: "Первые шаги", desc: "Одержать 5 побед", target: 5, current: profile.dailies.battlesWon, reward: 100 },
    { id: "veteran", title: "Ветеран", desc: "Одержать 50 побед", target: 50, current: profile.dailies.battlesWon, reward: 500 },
    { id: "collector", title: "Коллекционер", desc: "Сделать 50 молитв", target: 50, current: profile.dailies.gachaPulls, reward: 500 },
    { id: "rich", title: "Богач", desc: "Собрать 50,000 золота", target: 50000, current: profile.gold, reward: 250 },
    { id: "full_house", title: "Отряд в сборе", desc: "Получить 4 персонажей", target: 4, current: Object.keys(profile.roster).length, reward: 300 },
    { id: "master", title: "Мастер", desc: "Собрать 150,000 золота", target: 150000, current: profile.gold, reward: 500 },
    { id: "big_spender", title: "Транжира", desc: "Потратить 1000 смолы", target: 1000, current: profile.dailies.resinsSpent, reward: 600 },
    { id: "skill_master", title: "Мастер навыков", desc: "Использовать 1000 навыков", target: 1000, current: profile.dailies.skillsUsed, reward: 400 },
    { id: "gacha_addict", title: "Лудоман", desc: "Сделать 200 молитв", target: 200, current: profile.dailies.gachaPulls, reward: 1000 },
  ];

  const claimAchievement = (id: string, reward: number) => {
    updateProfile(p => {
       if (p.achievements[id]) return p;
       let next = {...p, gems: p.gems + reward, achievements: {...p.achievements}};
       next.achievements[id] = true;
       return next;
    });
  };

  return (
    
      <div className="w-full max-w-5xl h-[100dvh] md:h-[80vh] md:min-h-[600px] flex flex-col md:flex-row bg-[#0a0a0a] md:rounded-3xl border md:border-white/10 shadow-2xl font-sans text-white/90 overflow-hidden relative">
      <Joyride
        steps={tutorialSteps}
        run={showTutorial && activeTab === 'OVERVIEW'}
        continuous
        locale={{ last: 'Завершить', next: 'Далее', back: 'Назад', skip: 'Пропустить' }}
        options={{
          buttons: ['back', 'close', 'primary', 'skip'],
          showProgress: true,
          primaryColor: '#6366f1',
          backgroundColor: '#18181b',
          textColor: '#ffffff',
          arrowColor: '#18181b',
          overlayColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 10000,
        }}
        styles={{
          tooltip: {
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backgroundColor: '#18181b',
            padding: '16px',
            maxWidth: isMobile ? '310px' : '380px',
            boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.9), 0 0 25px rgba(99, 102, 241, 0.15)',
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          tooltipTitle: {
            fontSize: '15px',
            fontWeight: 800,
            marginBottom: '8px',
            color: '#ffffff',
          },
          buttonPrimary: {
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '12px',
            padding: '7px 14px',
            backgroundColor: '#6366f1',
          },
          buttonBack: {
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '12px',
            marginRight: '8px',
          },
          buttonSkip: {
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '12px',
          }
        }}
        onEvent={handleJoyrideCallback}
      />

      
      {/* Sidebar Navigation - Desktop/Tablet Only */}
      <div className="hidden md:flex md:w-1/4 bg-[#111111] border-r border-white/5 flex-col shrink-0 overflow-y-auto">
         <div className="p-4 md:p-6 flex items-center justify-between">
            <div>
               <h1 className="text-xl font-black italic tracking-tight text-white uppercase leading-none">
                  DIFFERENT DIMENSION
               </h1>
               <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">Иное Измерение</p>
            </div>
            <button
               onClick={startTutorialManually}
               title="Пройти обучение заново"
               className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
            >
               <HelpCircle className="w-3.5 h-3.5" />
               <span>Гайд</span>
            </button>
         </div>
         
         <nav className="flex-1 flex flex-col gap-2 p-4">
            <button onClick={() => setActiveTab('OVERVIEW')} className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-colors ${activeTab === 'OVERVIEW' ? 'bg-[#1a1a1a] text-white' : 'hover:bg-[#1a1a1a]/50 text-white/50'}`}>
               <Compass className="w-5 h-5" /> Меню
            </button>
            <button onClick={() => setRoute('STORY')} className="desk-tutorial-story flex items-center gap-3 p-3 rounded-xl font-bold hover:bg-[#1a1a1a]/50 text-amber-500 transition-colors">
               <Book className="w-5 h-5" /> Сюжет
            </button>
            <button onClick={() => setRoute('MAP')} className="desk-tutorial-map flex items-center gap-3 p-3 rounded-xl font-bold hover:bg-[#1a1a1a]/50 text-indigo-400 transition-colors">
               <Globe className="w-5 h-5 animate-spin-slow" /> Карта мира
            </button>
            <button onClick={() => setActiveTab('DUNGEONS')} className={`desk-tutorial-dungeons flex items-center gap-3 p-3 rounded-xl font-bold transition-colors ${activeTab === 'DUNGEONS' ? 'bg-[#1a1a1a] text-blue-400' : 'hover:bg-[#1a1a1a]/50 text-white/50'}`}>
               <Swords className="w-5 h-5" /> Подземелья
            </button>
            <button onClick={() => setRoute('META')} className="desk-tutorial-meta flex items-center gap-3 p-3 rounded-xl font-bold hover:bg-[#1a1a1a]/50 text-white/50 group transition-colors">
               <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Мета-гайд
            </button>
            <button onClick={() => setActiveTab('DAILIES')} className={`desk-tutorial-dailies flex items-center gap-3 p-3 rounded-xl font-bold transition-colors ${activeTab === 'DAILIES' ? 'bg-[#1a1a1a] text-green-400' : 'hover:bg-[#1a1a1a]/50 text-white/50'}`}>
               <CheckCircle className="w-5 h-5" /> Поручения
            </button>
            <button onClick={() => setActiveTab('EXPEDITIONS')} className={`desk-tutorial-expeditions flex items-center gap-3 p-3 rounded-xl font-bold transition-colors ${activeTab === 'EXPEDITIONS' ? 'bg-[#1a1a1a] text-orange-400' : 'hover:bg-[#1a1a1a]/50 text-white/50'}`}>
               <Map className="w-5 h-5" /> Экспедиции
            </button>
            <button onClick={() => setActiveTab('EVENTS')} className={`desk-tutorial-events flex items-center gap-3 p-3 rounded-xl font-bold transition-colors ${activeTab === 'EVENTS' ? 'bg-[#1a1a1a] text-purple-400' : 'hover:bg-[#1a1a1a]/50 text-white/50'}`}>
               <Calendar className="w-5 h-5" /> События
            </button>
            <button onClick={() => setActiveTab('ACHIEVEMENTS')} className={`desk-tutorial-achievements flex items-center gap-3 p-3 rounded-xl font-bold transition-colors ${activeTab === 'ACHIEVEMENTS' ? 'bg-[#1a1a1a] text-yellow-400' : 'hover:bg-[#1a1a1a]/50 text-white/50'}`}>
               <Star className="w-5 h-5" /> Достижения
            </button>
            <button onClick={() => setActiveTab('SHOP')} className={`desk-tutorial-shop flex items-center gap-3 p-3 rounded-xl font-bold transition-colors ${activeTab === 'SHOP' ? 'bg-[#1a1a1a] text-pink-400' : 'hover:bg-[#1a1a1a]/50 text-white/50'}`}>
               <Gift className="w-5 h-5" /> Магазин
            </button>
            
            <div className="my-4 border-t border-white/5"></div>
            
            <button onClick={() => setRoute('ROSTER')} className="desk-tutorial-roster flex items-center gap-3 p-3 rounded-xl font-bold hover:bg-[#1a1a1a]/50 text-white/50 transition-colors">
               <Users className="w-5 h-5" /> Отряд ({Object.keys(profile.roster).length})
            </button>
            <button onClick={() => setRoute('GACHA')} className="desk-tutorial-gacha flex items-center gap-3 p-3 rounded-xl font-bold hover:bg-[#1a1a1a]/50 text-white/50 transition-colors">
               <Star className="w-5 h-5" /> Молитвы
            </button>
            <button onClick={() => setRoute('BP')} className="desk-tutorial-bp flex items-center gap-3 p-3 rounded-xl font-bold hover:bg-[#1a1a1a]/50 text-white/50 transition-colors">
               <Gift className="w-5 h-5" /> Бравл Пасс
            </button>
            <button onClick={() => setRoute('ABYSS')} className="desk-tutorial-abyss flex items-center gap-3 p-3 rounded-xl font-bold hover:bg-[#1a1a1a]/50 text-purple-400 transition-colors">
               <Layers className="w-5 h-5 text-purple-400" /> Бездна
            </button>
            <button onClick={() => setRoute('BOSS_RUSH_MENU')} className="desk-tutorial-bossrush flex items-center gap-3 p-3 rounded-xl font-bold hover:bg-fuchsia-950/40 text-fuchsia-300 transition-colors border border-fuchsia-500/30">
               <Skull className="w-5 h-5 text-fuchsia-400" /> Теневой Натиск
            </button>
         </nav>
         {onLogout && (
           <div className="p-4 border-t border-white/5 flex flex-col gap-3">
              <div className="flex items-center gap-3 px-2">
                 <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold uppercase text-lg shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                    {username?.charAt(0) || 'И'}
                 </div>
                 <div className="flex-1 truncate">
                    <div className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Аккаунт</div>
                    <div className="text-sm font-bold text-white truncate">{username || 'Игрок'}</div>
                 </div>
              </div>
              <button onClick={onLogout} className="flex items-center justify-center gap-3 p-3 w-full rounded-xl font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                 <X className="w-5 h-5" /> Выйти
              </button>
           </div>
         )}
      </div>

      {/* Interactive Navigation Drawer Overlay for Mobile / Tablet */}
      {menuOpen && (
         <div className="fixed inset-0 z-50 bg-[#0a0a0a]/98 backdrop-blur-xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-205">
            {/* Top Close Row */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
               <div>
                  <h2 className="text-lg font-black italic tracking-tight text-white uppercase leading-none">
                     DIFFERENT DIMENSION
                  </h2>
                  <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">Иное Измерение</p>
               </div>
               <div className="flex items-center gap-2">
                  <button 
                     onClick={() => { startTutorialManually(); }}
                     className="px-2.5 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition"
                  >
                     <HelpCircle className="w-3.5 h-3.5" />
                     <span>Обучение</span>
                  </button>
                  <button 
                     onClick={() => { setMenuOpen(false); if (showTutorial) setShowTutorial(false); }}
                     className="p-2.5 bg-[#111111] border border-white/5 hover:bg-[#1a1a1a] rounded-2xl text-white/50 active:scale-95 transition"
                  >
                     <X className="w-5 h-5" />
                  </button>
               </div>
            </div>

            {/* Unified Scrollable Drawer Container */}
            <div className="flex-1 overflow-y-auto pr-1 pb-6 space-y-4">
               {/* Main Tabs Navigation Grid */}
               <div className="grid grid-cols-2 gap-3">
               <button 
                  onClick={() => { setActiveTab('OVERVIEW'); setMenuOpen(false); }}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 text-center h-24 ${
                     activeTab === 'OVERVIEW' 
                        ? 'border-blue-500/50 bg-blue-500/10 text-white' 
                        : 'border-white/5 bg-[#111111]/40 text-white/50 hover:bg-[#111111]'
                  }`}
               >
                  <Compass className="w-6 h-6 text-blue-400" />
                  <span className="text-xs font-bold font-mono">Главная</span>
               </button>

               <button 
                  onClick={() => { setRoute('STORY'); setMenuOpen(false); }}
                  className="mob-tutorial-story flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-white/5 bg-[#111111]/40 text-white/50 hover:bg-[#111111] transition-all gap-2 text-center h-24"
               >
                  <Book className="w-6 h-6 text-amber-500" />
                  <span className="text-xs font-bold font-mono text-amber-400">Сюжет</span>
               </button>

               <button 
                  onClick={() => { setRoute('MAP'); setMenuOpen(false); }}
                  className="mob-tutorial-map flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-white/5 bg-[#111111]/40 text-white/50 hover:bg-[#111111] transition-all gap-2 text-center h-24"
               >
                  <Globe className="w-6 h-6 text-indigo-400 animate-spin-slow" />
                  <span className="text-xs font-bold font-mono text-indigo-400">Карта мира</span>
               </button>

               <button 
                  onClick={() => { setRoute('BOSS_RUSH_MENU'); setMenuOpen(false); }}
                  className="mob-tutorial-bossrush flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-fuchsia-500/50 bg-fuchsia-950/40 text-fuchsia-300 hover:bg-fuchsia-900/50 transition-all gap-1.5 text-center h-24 relative overflow-hidden"
               >
                  <div className="absolute top-1 right-1 px-1 bg-fuchsia-500 text-[8px] font-black text-white rounded uppercase">NEW</div>
                  <Skull className="w-6 h-6 text-fuchsia-400" />
                  <span className="text-xs font-bold font-mono text-fuchsia-200">Теневой Натиск</span>
               </button>

               <button 
                  onClick={() => { setActiveTab('DUNGEONS'); setMenuOpen(false); }}
                  className={`mob-tutorial-dungeons flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 text-center h-24 ${
                     activeTab === 'DUNGEONS' 
                        ? 'border-blue-500/50 bg-blue-500/10 text-white' 
                        : 'border-white/5 bg-[#111111]/40 text-white/50 hover:bg-[#111111]'
                  }`}
               >
                  <Swords className="w-6 h-6 text-blue-400" />
                  <span className="text-xs font-bold font-mono">Подземелья</span>
               </button>

               <button 
                  onClick={() => { setActiveTab('DAILIES'); setMenuOpen(false); }}
                  className={`mob-tutorial-dailies flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 text-center h-24 ${
                     activeTab === 'DAILIES' 
                        ? 'border-green-500/50 bg-green-500/10 text-white' 
                        : 'border-white/5 bg-[#111111]/40 text-white/50 hover:bg-[#111111]'
                  }`}
               >
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-xs font-bold font-mono">Поручения</span>
               </button>

               <button 
                  onClick={() => { setActiveTab('EXPEDITIONS'); setMenuOpen(false); }}
                  className={`mob-tutorial-expeditions flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 text-center h-24 ${
                     activeTab === 'EXPEDITIONS' 
                        ? 'border-orange-500/50 bg-orange-500/10 text-white' 
                        : 'border-white/5 bg-[#111111]/40 text-white/50 hover:bg-[#111111]'
                  }`}
               >
                  <Map className="w-6 h-6 text-orange-400" />
                  <span className="text-xs font-bold font-mono">Экспедиции</span>
               </button>

               <button 
                  onClick={() => { setActiveTab('EVENTS'); setMenuOpen(false); }}
                  className={`mob-tutorial-events flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 text-center h-24 ${
                     activeTab === 'EVENTS' 
                        ? 'border-purple-500/50 bg-purple-500/10 text-white' 
                        : 'border-white/5 bg-[#111111]/40 text-white/50 hover:bg-[#111111]'
                  }`}
               >
                  <Calendar className="w-6 h-6 text-purple-400" />
                  <span className="text-xs font-bold font-mono">События</span>
               </button>

               <button 
                  onClick={() => { setActiveTab('ACHIEVEMENTS'); setMenuOpen(false); }}
                  className={`mob-tutorial-achievements flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 text-center h-24 ${
                     activeTab === 'ACHIEVEMENTS' 
                        ? 'border-yellow-500/50 bg-yellow-500/10 text-white' 
                        : 'border-white/5 bg-[#111111]/40 text-white/50 hover:bg-[#111111]'
                  }`}
               >
                  <Star className="w-6 h-6 text-yellow-400" />
                  <span className="text-xs font-bold font-mono">Достижения</span>
               </button>

               <button 
                  onClick={() => { setActiveTab('SHOP'); setMenuOpen(false); }}
                  className={`mob-tutorial-shop flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all col-span-2 gap-2 text-center h-20 ${
                     activeTab === 'SHOP' 
                        ? 'border-pink-500/50 bg-pink-500/10 text-white' 
                        : 'border-white/5 bg-[#111111]/40 text-white/50 hover:bg-[#111111]'
                  }`}
               >
                  <Gift className="w-5 h-5 text-pink-400" />
                  <span className="text-xs font-bold font-mono">Магазин обмена</span>
               </button>
               </div>

               {/* Game Screen Direct Links */}
               <div className="pt-2 border-t border-white/5">
               <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2.5">Глобальные разделы</h3>
               <div className="grid grid-cols-3 gap-2">
                  <button 
                     onClick={() => { setRoute('ROSTER'); setMenuOpen(false); }}
                     className="mob-tutorial-roster flex flex-col items-center justify-center py-2.5 px-1 bg-[#111111] border border-white/5 hover:bg-[#1a1a1a] active:scale-95 transition rounded-2xl text-white/70"
                  >
                     <Users className="w-4 h-4 mb-1 text-white/50" />
                     <span className="text-[10px] font-bold truncate">Отряд</span>
                  </button>
                  <button 
                     onClick={() => { setRoute('GACHA'); setMenuOpen(false); }}
                     className="mob-tutorial-gacha flex flex-col items-center justify-center py-2.5 px-1 bg-[#111111] border border-white/5 hover:bg-[#1a1a1a] active:scale-95 transition rounded-2xl text-white/70"
                  >
                     <Star className="w-4 h-4 mb-1 text-yellow-500 fill-yellow-500/20" />
                     <span className="text-[10px] font-bold truncate">Молитвы</span>
                  </button>
                  <button 
                     onClick={() => { setRoute('BP'); setMenuOpen(false); }}
                     className="mob-tutorial-bp flex flex-col items-center justify-center py-2.5 px-1 bg-[#111111] border border-white/5 hover:bg-[#1a1a1a] active:scale-95 transition rounded-2xl text-white/70"
                  >
                     <Gift className="w-4 h-4 mb-1 text-pink-400" />
                     <span className="text-[10px] font-bold truncate">Бравл Пасс</span>
                  </button>
                  <button 
                     onClick={() => { setRoute('ABYSS'); setMenuOpen(false); }}
                     className="mob-tutorial-abyss flex flex-col items-center justify-center py-2.5 px-1 bg-[#111111] border border-white/5 hover:bg-[#1a1a1a] active:scale-95 transition rounded-2xl text-white/70"
                  >
                     <Layers className="w-4 h-4 mb-1 text-purple-400" />
                     <span className="text-[10px] font-bold truncate">Бездна</span>
                  </button>
                  <button 
                     onClick={() => { setRoute('BOSS_RUSH_MENU'); setMenuOpen(false); }}
                     className="flex flex-col items-center justify-center py-2.5 px-1 bg-fuchsia-950/50 border border-fuchsia-500/50 hover:bg-fuchsia-900/50 active:scale-95 transition rounded-2xl text-fuchsia-200"
                  >
                     <Skull className="w-4 h-4 mb-1 text-fuchsia-400" />
                     <span className="text-[10px] font-bold truncate">Натиск</span>
                  </button>
                  <button 
                     onClick={() => { setRoute('META'); setMenuOpen(false); }}
                     className="mob-tutorial-meta flex flex-col items-center justify-center py-2.5 px-1 bg-[#111111] border border-white/5 hover:bg-[#1a1a1a] active:scale-95 transition rounded-2xl text-white/70"
                  >
                     <Trophy className="w-4 h-4 mb-1 text-yellow-400" />
                     <span className="text-[10px] font-bold truncate">Мета</span>
                  </button>
               </div>
               {onLogout && (
                  <div className="mt-4 pt-4 border-t border-white/5 w-full flex flex-col gap-4">
                     <div className="flex items-center justify-center gap-2 px-2 bg-[#111111] py-2 rounded-2xl border border-white/5">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold uppercase text-[10px]">
                           {username?.charAt(0) || 'И'}
                        </div>
                        <span className="text-sm font-bold text-white/90 truncate">{username || 'Игрок'}</span>
                     </div>
                     <button 
                        onClick={() => { onLogout(); setMenuOpen(false); }}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 active:scale-95 transition rounded-2xl text-red-400 font-bold text-xs uppercase tracking-widest"
                     >
                        <X className="w-4 h-4" /> Выйти из аккаунта
                     </button>
                  </div>
               )}
               </div>
            </div>
         </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-[#0a0a0a] overflow-y-auto">
         {/* Top Bar / Currency & Navigation Toggle */}
         <div className="h-14 sm:h-16 border-b border-white/5 flex items-center justify-between px-3 sm:px-6 bg-[#111111] shrink-0 font-mono text-sm sm:text-base">
            
            {/* Mobile Header elements on the left */}
            <div className="md:hidden flex items-center gap-2">
               <button 
                  onClick={() => setMenuOpen(true)}
                  className="flex items-center gap-1.5 bg-[#1a1a1a] hover:bg-white/10 active:scale-95 transition border border-white/10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black whitespace-nowrap"
               >
                  <Menu className="w-4 h-4 text-blue-400" />
                  <span>МЕНЮ</span>
               </button>
               <button 
                  onClick={() => setRoute('BOSS_RUSH_MENU')}
                  className="flex items-center gap-1 bg-fuchsia-950/60 hover:bg-fuchsia-900/80 active:scale-95 transition border border-fuchsia-500/50 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black text-fuchsia-300 whitespace-nowrap shadow-lg shadow-fuchsia-900/30"
               >
                  <Skull className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>НАТИСК</span>
               </button>
               <button 
                  onClick={startTutorialManually}
                  className="flex items-center gap-1 bg-[#1a1a1a] hover:bg-white/10 active:scale-95 transition border border-indigo-500/30 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black text-indigo-400 whitespace-nowrap"
                  title="Запустить интерактивное обучение"
               >
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>ГИД</span>
               </button>
            </div>

            {/* Desktop Center Header / Quick Boss Rush */}
            <div className="hidden md:flex items-center gap-2">
               <button 
                  onClick={startTutorialManually}
                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold transition"
                  title="Запустить интерактивное обучение"
               >
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Обучение</span>
               </button>
               <button 
                  onClick={() => setRoute('BOSS_RUSH_MENU')}
                  className="flex items-center gap-2 px-3 py-1 bg-fuchsia-950/40 hover:bg-fuchsia-900/60 border border-fuchsia-500/40 text-fuchsia-300 rounded-xl text-xs font-bold transition shadow-lg shadow-fuchsia-950/50"
               >
                  <Skull className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Теневой Натиск</span>
                  <span className="bg-fuchsia-500/30 text-fuchsia-200 text-[9px] px-1 rounded uppercase font-black">Босс-раш</span>
               </button>
            </div>

            {/* Currency trackers */}
            <div className="flex items-center gap-3 sm:gap-6">
               <div className="flex items-center gap-1.5" title="Смола (Используется для подземелий)">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  <span className="font-bold text-xs sm:text-base">{profile.resin}</span><span className="text-[10px] sm:text-sm text-white/40">/160</span>
               </div>
               <div className="flex items-center gap-1.5" title="Гемы (Используются для молитв)">
                  <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                  <span className="font-bold text-xs sm:text-base">{profile.gems}</span>
               </div>
            </div>
         </div>

         {/* Dynamic Body */}
         <div className="p-4 sm:p-8 flex-1 overflow-x-hidden overflow-y-auto">
            {activeTab === 'OVERVIEW' && (
               <div className="flex flex-col space-y-6 animate-in fade-in">
                  <div className="bg-[#111111] rounded-3xl p-5 sm:p-8 border border-white/10 relative overflow-hidden group">
                     <div className="relative z-10 flex flex-col items-start max-w-xl">
                        <div className="flex items-center gap-2 mb-4">
                           <span className="bg-indigo-500/10 text-indigo-400 font-black tracking-widest text-[9px] uppercase px-2.5 py-1 rounded-full border border-indigo-500/20">Профиль Путешественника</span>
                           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight text-white leading-none">
                           {profile.team.length > 0 ? (profile.roster[profile.team[0]] ? characterBlueprints[profile.team[0]]("m", 1, 0).name : "Авантюрист") : "Авантюрист"}
                        </h2>
                        <p className="text-white/50 font-medium text-xs sm:text-sm leading-relaxed mb-6 max-w-md">
                           Ваш отряд готов к покорению кодовых пространств. Используйте экспедиции и поручения для накопления ресурсов.
                        </p>
                        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                           <div className="bg-[#1a1a1a] px-4 py-3 rounded-3xl border border-white/5 flex flex-col items-start min-w-[120px] transition-colors">
                              <span className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">Золото Моры</span>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-white text-lg tabular-nums">{(profile.gold || 0).toLocaleString()}</span>
                                <div className="w-1 h-1 rounded-full bg-yellow-500/50" />
                              </div>
                           </div>
                           <div className="bg-[#1a1a1a] px-4 py-3 rounded-3xl border border-white/5 flex flex-col items-start min-w-[120px] transition-colors">
                              <span className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">Опыт Героя</span>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-white text-lg tabular-nums">{(profile.heroExp || 0).toLocaleString()}</span>
                                <div className="w-1 h-1 rounded-full bg-green-500/50" />
                              </div>
                           </div>
                        </div>
                     </div>
                     
                     <Compass className="absolute -right-12 -bottom-12 w-48 h-48 sm:w-64 sm:h-64 text-white/5 transform rotate-12 transition-transform group-hover:rotate-45 duration-1000" />
                  </div>

                  {/* Endgame Feature: Boss Rush / Shadow Rush Card */}
                  <div className="bg-[#1a111a] border border-fuchsia-500/20 rounded-3xl p-5 sm:p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                     <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="bg-fuchsia-500/20 text-fuchsia-300 font-black tracking-widest text-[9px] uppercase px-2.5 py-1 rounded-full border border-fuchsia-500/30 flex items-center gap-1.5">
                              <Skull className="w-3 h-3 text-fuchsia-400" /> Новый Эндгейм-Режим
                           </span>
                           <span className="text-[10px] text-fuchsia-400 font-mono font-bold">3 Отряда против 3 Мега-Боссов</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">ТЕНЕВОЙ НАТИСК</h3>
                        <p className="text-white/70 text-xs sm:text-sm mt-1 max-w-xl">
                           Сформируйте 3 уникальных отряда без повторения персонажей и одолейте Испепелителя, Абсолютный Ноль и Кристального Титана!
                        </p>
                        <div className="flex items-center gap-3 mt-3 text-xs font-mono">
                           <span className="text-white/60 font-bold flex items-center gap-1">💎 200 Гемов</span>
                           <span className="text-white/60 font-bold flex items-center gap-1">✨ 50,000 Моры</span>
                           <span className="text-white/60 font-bold flex items-center gap-1">📦 Лег. Артефакты</span>
                        </div>
                     </div>
                     <button
                        onClick={() => setRoute('BOSS_RUSH_MENU')}
                        className="relative z-10 w-full md:w-auto px-6 py-3.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black text-xs uppercase tracking-widest rounded-3xl active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
                     >
                        <Skull className="w-4 h-4" />
                        <span>Начать Натиск</span>
                     </button>
                  </div>
                  
                  <div className="pb-10">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-xs sm:text-sm uppercase tracking-widest text-white/40 flex items-center gap-2">
                           <Users className="w-4 h-4 text-indigo-500" /> Активный отряд
                        </h3>
                        <div className="h-px flex-1 bg-white/5 ml-4" />
                     </div>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                        {profile.team.map(id => {
                           const charInfo = profile.roster[id];
                           if (!charInfo) return null;
                           const char = characterBlueprints[id]("mock", charInfo.level, charInfo.constellation);
                           const rarity = charRarity[id];
                           const rColor = rarity === 'S' ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' : rarity === 'A' ? 'text-purple-400' : 'text-blue-400';
                           
                           return (
                              <div key={id} className="group bg-[#111111] border border-white/5 p-4 rounded-3xl flex items-center gap-4 hover:bg-[#1a1a1a] transition-all cursor-pointer relative overflow-hidden">
                                 <div className={cn("w-14 h-14 rounded-2xl border border-white/10 font-bold text-xl flex items-center justify-center relative transition-transform group-hover:scale-105 overflow-hidden shrink-0", char.color)}>
                                    {getCharSplash(id) ? (
                                          <img src={getCharSplash(id) || ""} className="w-full h-full object-cover grayscale-[0.1] transition-all" referrerPolicy="no-referrer" />
                                       ) : (
                                          <span className="drop-shadow-md">{getCharEmoji(id)}</span>
                                       )}
                                    <div className="absolute top-0 right-0 p-1 bg-black/60 rounded-bl-lg">
                                       <div className={cn("text-[8px] font-black leading-none", rColor)}>{rarity}</div>
                                    </div>
                                    <div className="absolute bottom-0 w-full bg-black/60 pt-1 pb-0.5 text-center">
                                       <span className="text-[8px] font-black text-white/70 tracking-widest leading-none">LVL {char.level}</span>
                                    </div>
                                 </div>
                                 <div className="min-w-0 pr-4">
                                    <div className="font-black text-sm uppercase tracking-tight text-white transition-colors truncate">{char.name}</div>
                                    <div className="text-[9px] font-black font-mono text-white/40 uppercase tracking-widest mt-0.5">Constellation {char.constellation}</div>
                                 </div>
                                 
                                 <div className={cn("absolute right-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity", rarity === 'S' ? 'bg-yellow-500' : 'bg-indigo-500')} />
                              </div>
                           );
                        })}
                        {profile.team.length < 4 && (
                           <button 
                              className="bg-[#0a0a0a]/40 border-2 border-dashed border-white/5 p-4 rounded-3xl flex items-center justify-center cursor-pointer hover:bg-[#111111]/80 hover:border-white/10 transition-all h-[84px] group w-full"
                              onClick={() => setRoute('ROSTER')}
                           >
                              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                                 <Users className="w-4 h-4 text-white/20 group-hover:text-indigo-400" />
                              </div>
                              <span className="ml-3 text-white/30 font-black text-[10px] uppercase tracking-widest group-hover:text-white/60 transition-colors uppercase">
                                Добавить
                              </span>
                           </button>
                        )}
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'DAILIES' && (
               <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><CheckCircle className="text-green-500"/> Ежедневные Поручения</h2>
                  <div className="space-y-4">
                     {DAILIES.map(d => {
                        const isDone = d.current >= d.target;
                        const isClaimed = profile.dailies.claimed[d.id];
                        return (
                           <div key={d.id} className="bg-[#111111] border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="flex-1">
                                 <h3 className="font-bold text-white/90">{d.title}</h3>
                                 <p className="text-sm text-white/50 font-mono mt-1">{d.desc}</p>
                                 <div className="mt-3 flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-[#0a0a0a] rounded-full overflow-hidden border border-white/5">
                                       <div className="h-full bg-green-500 transition-all" style={{ width: `${Math.min(100, (d.current/d.target)*100)}%` }} />
                                    </div>
                                    <span className="text-xs font-mono font-bold text-white/40 w-12 text-right">{Math.min(d.current, d.target)}/{d.target}</span>
                                 </div>
                              </div>
                              <div className="flex flex-col gap-2 shrink-0 items-end">
                                 <button 
                                    disabled={!isDone || isClaimed}
                                    onClick={() => claimDaily(d.id, d.rewardGems, d.rewardBp)}
                                    className={`px-4 py-2 rounded font-bold uppercase text-xs tracking-wider transition-all min-w-[120px] w-full ${
                                       isClaimed ? 'bg-[#0a0a0a] text-white/40 border border-white/5' : 
                                       isDone ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20' : 
                                       'bg-[#1a1a1a] text-white/40 cursor-not-allowed'
                                    }`}
                                 >
                                    {isClaimed ? 'Получено' : 'Забрать'}
                                 </button>
                                 <div className="flex gap-2 text-[10px] font-mono text-white/50 justify-center w-full">
                                    <span className="flex items-center gap-0.5 text-pink-400"><Gem className="w-3 h-3"/> +{d.rewardGems}</span>
                                    <span className="flex items-center gap-0.5 text-blue-300">BP +{d.rewardBp}</span>
                                 </div>
                              </div>
                           </div>
                        )
                     })}
                  </div>
               </div>
            )}

            {activeTab === 'ACHIEVEMENTS' && (
               <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Star className="text-yellow-400"/> Достижения</h2>
                  <div className="space-y-4">
                     {ACHIEVEMENTS.map(d => {
                        const isDone = d.current >= d.target;
                        const isClaimed = profile.achievements[d.id];
                        return (
                           <div key={d.id} className="bg-[#111111] border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="flex-1">
                                 <h3 className="font-bold text-white/90">{d.title}</h3>
                                 <p className="text-sm text-white/50 font-mono mt-1">{d.desc}</p>
                                 <div className="mt-3 flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-[#0a0a0a] rounded-full overflow-hidden border border-white/5">
                                       <div className="h-full bg-yellow-500 transition-all" style={{ width: `${Math.min(100, (d.current/d.target)*100)}%` }} />
                                    </div>
                                    <span className="text-xs font-mono font-bold text-white/40 w-16 text-right">{Math.min(d.current, d.target).toLocaleString()}/{d.target.toLocaleString()}</span>
                                 </div>
                              </div>
                              <div className="flex flex-col items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                <div className="text-pink-400 font-bold text-sm tracking-wider flex items-center gap-1">
                                   <Gem className="w-3 h-3" /> {d.reward}
                                </div>
                                <button 
                                   disabled={!isDone || isClaimed}
                                   onClick={() => claimAchievement(d.id, d.reward)}
                                   className={`px-4 py-2 rounded font-bold uppercase text-xs tracking-wider transition-all min-w-[120px] w-full sm:w-auto ${
                                      isClaimed ? 'bg-[#0a0a0a] text-white/40 border border-white/5' : 
                                      isDone ? 'bg-yellow-600 hover:bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 
                                      'bg-[#1a1a1a] text-white/40 cursor-not-allowed'
                                   }`}
                                >
                                   {isClaimed ? 'Получено' : 'Забрать'}
                                </button>
                              </div>
                           </div>
                        )
                     })}
                  </div>
               </div>
            )}

            {activeTab === 'SHOP' && (
               <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Gift className="text-pink-400"/> Магазин Обмена</h2>
                  <p className="text-white/50 font-mono mb-8">Лишнее золото или ресурсы можно обменять на гемы!</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                        <Gem className="w-12 h-12 text-pink-400 mb-4 drop-shadow-[0_0_15px_rgba(244,114,182,0.6)]" />
                        <h3 className="font-bold text-xl mb-2 text-white/90">Горсть Гемов</h3>
                        <p className="text-pink-400 font-mono font-bold text-lg mb-6">+160 Гемов</p>
                        <button 
                           onClick={() => {
                              if (profile.gold >= 25000) updateProfile(p => ({...p, gold: p.gold - 25000, gems: p.gems + 160, dailies: { ...p.dailies, itemsBought: (p.dailies.itemsBought || 0) + 1}}));
                              else alert("Недостаточно золота!");
                           }}
                           className="w-full py-3 bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-600 text-yellow-500 font-bold rounded-xl uppercase tracking-wider transition-all"
                        >
                           Купить за 25k G
                        </button>
                     </div>

                     <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                        <Zap className="w-12 h-12 text-blue-400 mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                        <h3 className="font-bold text-xl mb-2 text-white/90">Фляга Смолы</h3>
                        <p className="text-blue-400 font-mono font-bold text-lg mb-6">+60 Смолы</p>
                        <button 
                           onClick={() => {
                              if (profile.gems >= 50) updateProfile(p => ({...p, gems: p.gems - 50, resin: p.resin + 60, dailies: { ...p.dailies, itemsBought: (p.dailies.itemsBought || 0) + 1}}));
                              else alert("Недостаточно гемов!");
                           }}
                           className="w-full py-3 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600 text-blue-400 font-bold rounded-xl uppercase tracking-wider transition-all"
                        >
                           Купить за 50 💎
                        </button>
                     </div>

                     <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl"></div>
                        <div className="relative mb-4">
                           <Gem className="w-14 h-14 text-pink-400 drop-shadow-[0_0_20px_rgba(244,114,182,0.8)]" />
                           <Gem className="w-8 h-8 text-pink-300 absolute -bottom-2 -right-4" />
                        </div>
                        <h3 className="font-bold text-xl mb-2 text-white/90">Мешок Гемов</h3>
                        <p className="text-pink-400 font-mono font-bold text-lg mb-6">+1600 Гемов</p>
                        <button 
                           onClick={() => {
                              if (profile.gold >= 250000) updateProfile(p => ({...p, gold: p.gold - 250000, gems: p.gems + 1600, dailies: { ...p.dailies, itemsBought: (p.dailies.itemsBought || 0) + 1}}));
                              else alert("Недостаточно золота!");
                           }}
                           className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-xl uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(202,138,4,0.3)]"
                        >
                           Купить за 250k G
                        </button>
                     </div>
                  </div>

                  <div className="mt-8 bg-[#111111] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
                     <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1">
                           <h3 className="font-bold text-xl mb-2 text-white/90 flex items-center gap-2">
                              <Ticket className="w-5 h-5 text-purple-400" /> Ввод промокода
                           </h3>
                           <p className="text-white/50 text-sm font-mono mb-4 md:mb-0">
                              Активируйте секретные коды от разработчиков для получения уникальных наград.
                           </p>
                        </div>
                        <form onSubmit={handlePromoSubmit} className="flex-1 w-full flex flex-col items-end gap-3">
                           <div className="w-full flex gap-2">
                              <input 
                                 type="text" 
                                 value={promoCode}
                                 onChange={(e) => setPromoCode(e.target.value)}
                                 placeholder="Введите код..."
                                 className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 uppercase font-mono tracking-widest"
                              />
                              <button 
                                 type="submit"
                                 disabled={promoLoading || !promoCode.trim()}
                                 className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 disabled:text-white/40 text-white font-black uppercase tracking-widest rounded-xl text-xs transition-all flex items-center justify-center min-w-[120px]"
                              >
                                 {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Активировать'}
                              </button>
                           </div>
                           {promoMessage && (
                              <div className={`text-xs font-mono font-bold w-full ${promoMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                 {promoMessage.text}
                              </div>
                           )}
                        </form>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'EVENTS' && (
               <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 pt-4 pb-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Calendar className="text-purple-400"/> Временные События</h2>
                  <EventsMenu profile={profile} updateProfile={updateProfile} setRoute={setRoute} />
               </div>
            )}

            {activeTab === 'EXPEDITIONS' && (
               <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Map className="text-orange-400"/> Экспедиции</h2>
                  <p className="text-white/50 font-mono mb-8">Отправляйте свободных персонажей на добычу ресурсов.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[...Array(4)].map((_, i) => {
                        const exp = profile.expeditions[i];
                        if (exp) {
                           const isDone = Date.now() >= exp.startTime + exp.durationHours * 3600000;
                           const char = characterBlueprints[exp.charId]("t", 1, 0);
                           return (
                              <div key={i} className="bg-[#111111] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-[#1a1a1a] rounded-full border-2 border-white/10 flex items-center justify-center overflow-hidden">
                                       <div className={`w-full h-full text-xs font-black flex items-center justify-center text-white ${char.color}`}>
                                          {char.name.substring(0,2).toUpperCase()}
                                       </div>
                                    </div>
                                    <div>
                                       <h4 className="font-bold text-white/90">{char.name}</h4>
                                       <p className="text-xs font-mono text-white/50">
                                          {isDone ? 'Сбор завершен!' : 'В экспедиции...'}
                                       </p>
                                    </div>
                                 </div>
                                 <button 
                                    onClick={() => {
                                       if (isDone) {
                                          const isGold = i % 2 === 0;
                                          updateProfile(p => {
                                             let nextExp = [...p.expeditions];
                                             nextExp.splice(i, 1);
                                             return {
                                                ...p,
                                                gold: p.gold + (isGold ? 5000 * exp.durationHours : 0),
                                                heroExp: p.heroExp + (!isGold ? 2000 * exp.durationHours : 0),
                                                expeditions: nextExp
                                             }
                                          });
                                       }
                                    }}
                                    disabled={!isDone}
                                    className={`px-4 py-2 rounded font-bold uppercase text-xs tracking-wider transition ${isDone ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-[#1a1a1a] text-white/40 cursor-not-allowed'}`}
                                 >
                                    {isDone ? 'Забрать' : 'В пути'}
                                 </button>
                              </div>
                           );
                        } else {
                           return (
                              <div key={i} className="bg-[#111111]/50 border border-dashed border-white/10 p-4 rounded-2xl flex items-center justify-center min-h-[80px]">
                                 <button 
                                    onClick={() => {
                                       const availableChars = Object.keys(profile.roster).filter(id => !profile.expeditions.find(e => e.charId === id));
                                       if (availableChars.length === 0) { alert("Нет свободных персонажей!"); return; }
                                       
                                       updateProfile(p => ({
                                          ...p,
                                          expeditions: [...p.expeditions, {
                                             id: Math.random().toString(),
                                             charId: availableChars[0],
                                             startTime: Date.now(),
                                             durationHours: 4,
                                             completed: false,
                                             claimed: false
                                          }]
                                       }));
                                    }}
                                    className="text-white/50 hover:text-orange-400 font-bold text-sm tracking-widest uppercase flex items-center gap-2 transition"
                                 >
                                    + Отправить
                                 </button>
                              </div>
                           );
                        }
                     })}
                  </div>
               </div>
            )}

            {activeTab === 'DUNGEONS' && (
               <div className="animate-in fade-in pt-4 pb-8 max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                     <h2 className="text-2xl font-bold flex items-center gap-2"><Swords className="text-blue-500"/> Выбор Подземелья</h2>
                     <button
                        onClick={() => setRoute('BOSS_RUSH_MENU')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-fuchsia-950/60 hover:bg-fuchsia-900 border border-fuchsia-500/50 text-fuchsia-300 rounded-2xl text-xs font-bold transition shadow-lg"
                     >
                        <Skull className="w-4 h-4 text-fuchsia-400" />
                        <span>Теневой Натиск</span>
                     </button>
                  </div>

                  {/* Boss Rush Quick Access */}
                  <div className="mb-6 bg-gradient-to-r from-fuchsia-950/50 via-purple-950/30 to-[#111111] border border-fuchsia-500/40 p-4 rounded-2xl flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-fuchsia-600/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
                           <Skull className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-sm font-black text-white uppercase tracking-tight">Эндгейм испытание: Теневой Натиск</h3>
                           <p className="text-xs text-white/50 font-mono">3 отряда против 3 уникальных боссов</p>
                        </div>
                     </div>
                     <button
                        onClick={() => setRoute('BOSS_RUSH_MENU')}
                        className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition"
                     >
                        Открыть
                     </button>
                  </div>
                  
                  <div className="space-y-6">
                     {(['GOLD', 'EXP', 'ARTIFACT'] as const).map(dType => {
                         const title = dType === 'GOLD' ? 'Подземелье Богатства' : dType === 'EXP' ? 'Подземелье Мудрости' : 'Подземелье Реликвий';
                         const desc = dType === 'GOLD' ? 'Много золота, мало опыта.' : dType === 'EXP' ? 'Много опыта, мало золота.' : 'Гарантированный шанс артефакта на высоких уровнях.';
                         const icon = dType === 'GOLD' ? '💎' : dType === 'EXP' ? '✨' : '📦';
                         const color = dType === 'GOLD' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-900/10' : dType === 'EXP' ? 'text-green-400 border-green-500/30 bg-green-900/10' : 'text-purple-400 border-purple-500/30 bg-purple-900/10';
                         const btnColor = dType === 'GOLD' ? 'bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-500 border border-yellow-600/50' : dType === 'EXP' ? 'bg-green-600/20 hover:bg-green-600/40 text-green-500 border border-green-600/50' : 'bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-600/50';

                         return (
                           <div key={dType} className={`border p-5 rounded-2xl ${color}`}>
                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                                <div className="flex items-center gap-3">
                                   <span className="text-2xl">{icon}</span>
                                   <div>
                                      <h3 className={`font-black text-xl tracking-tight uppercase ${color.split(' ')[0]}`}>{title}</h3>
                                      <p className="text-sm font-mono text-white/50">{desc}</p>
                                   </div>
                                </div>
                                {dType !== 'ARTIFACT' && (
                                   <div className="flex items-center gap-1.5 bg-[#0a0a0a]/60 p-1.5 rounded-2xl border border-white/5">
                                      <span className="text-[10px] font-black uppercase text-white/50 px-1">Заходов:</span>
                                      {[1, 2, 3, 4, 5].map(n => {
                                         const isSelected = (goldExpRuns[dType] || 1) === n;
                                         const cost = 20 * n;
                                         const hasResin = profile.resin >= cost;
                                         return (
                                            <button
                                               key={n}
                                               disabled={!hasResin && n > 1}
                                               onClick={() => setGoldExpRuns(prev => ({ ...prev, [dType]: n }))}
                                               className={`px-2 py-1 rounded-xl text-xs font-bold transition-all ${
                                                  isSelected
                                                     ? 'bg-indigo-600 text-white'
                                                     : !hasResin
                                                        ? 'text-white/30 cursor-not-allowed opacity-40'
                                                        : 'text-white/50 hover:bg-[#111111] hover:text-white'
                                               }`}
                                            >
                                               {n}x
                                            </button>
                                         );
                                      })}
                                   </div>
                                )}
                             </div>
                             
                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-5">
                                {[1, 2, 3, 4, 5, 6].map(lvl => {
                                   const currentRuns = goldExpRuns[dType] || 1;
                                   const totalCost = 20 * currentRuns;
                                   return (
                                      <div key={lvl} className="bg-[#0a0a0a]/80 border border-white/5 p-3 rounded-xl flex flex-col justify-between group">
                                         <div className="mb-3 flex justify-between items-center bg-[#111111]/40 p-1 rounded-md">
                                            <h4 className="font-bold text-white/70 text-xs">Ур. {lvl}</h4>
                                            <div className="flex items-center gap-0.5 text-[9px] font-bold text-blue-300 bg-blue-900/30 px-1 py-0.5 rounded border border-blue-800/50 uppercase">
                                               <Zap className="w-2.5 h-2.5 text-blue-400" /> {dType === 'ARTIFACT' ? 20 : totalCost}
                                            </div>
                                         </div>
                                         <button 
                                            onClick={() => {
                                               if (dType === 'ARTIFACT') {
                                                  setRoute('ARTIFACT_DUNGEON_SELECTOR');
                                               } else if (profile.resin >= totalCost) {
                                                  updateProfile(p => ({...p, resin: p.resin - totalCost, dailies: { ...p.dailies, resinsSpent: (p.dailies.resinsSpent || 0) + totalCost }}));
                                                  setRoute({ type: 'DUNGEON', level: lvl, dungeonType: dType, runs: currentRuns });
                                               } else {
                                                  alert("Недостаточно смолы!");
                                               }
                                            }}
                                            className={`w-full py-2 font-bold rounded text-xs uppercase tracking-widest transition-all ${btnColor}`}
                                         >
                                            {dType === 'ARTIFACT' ? 'Выбор' : 'Начать'}
                                         </button>
                                      </div>
                                   );
                                })}
                             </div>
                           </div>
                         );
                     })}
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
