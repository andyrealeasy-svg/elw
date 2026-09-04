const fs = require('fs');

let code = fs.readFileSync('src/components/HubMenu.tsx', 'utf8');

// 1. Update localStorage key to tutorial_completed_v3 and add isMobile state
const tutorialSetupCode = `  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('tutorial_completed_v3')) {
      setShowTutorial(true);
      if (window.innerWidth < 768) {
        setMenuOpen(true);
      }
    }
  }, []);

  const jumpToSection = (action: () => void) => {
    localStorage.setItem('tutorial_completed_v3', 'true');
    setShowTutorial(false);
    setMenuOpen(false);
    updateProfile(p => ({ ...p, tutorialCompleted: true }));
    action();
  };

  const restartTutorial = () => {
    localStorage.removeItem('tutorial_completed_v3');
    setActiveTab('OVERVIEW');
    if (window.innerWidth < 768) {
      setMenuOpen(true);
    }
    setShowTutorial(true);
  };

  const prefix = isMobile ? '.mob-' : '.desk-';
  const tutorialSteps: Step[] = [
    {
      target: prefix + 'tutorial-story',
      title: '📖 Сюжетная линия',
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/80 leading-relaxed">
            Здесь начинается ваш путь! Проходите сюжетные главы и миссии, знакомьтесь с историей мира и забирайте первые награды.
          </p>
          <div className="mt-1 pt-2 border-t border-white/10 flex flex-col gap-1.5">
            <span className="text-[11px] text-amber-400 font-medium">💡 Хотите начать прямо сейчас?</span>
            <button
              type="button"
              onClick={() => jumpToSection(() => setRoute('STORY'))}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black text-xs font-bold rounded-xl transition shadow-lg shadow-amber-500/20"
            >
              <span>⚔️ Перейти в Сюжет</span>
            </button>
          </div>
        </div>
      ),
      skipBeacon: true,
      placement: isMobile ? 'bottom' : 'right'
    },
    {
      target: prefix + 'tutorial-map',
      title: '🗺️ Карта мира',
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/80 leading-relaxed">
            Исследуйте глобальную карту: открывайте регионы, находите сундуки, телепорты и скрытые испытания.
          </p>
          <div className="mt-1 pt-2 border-t border-white/10 flex flex-col gap-1.5">
            <span className="text-[11px] text-indigo-400 font-medium">💡 Откройте карту и взгляните на просторы мира:</span>
            <button
              type="button"
              onClick={() => jumpToSection(() => setRoute('MAP'))}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-500/20"
            >
              <span>🌐 Открыть Карту мира</span>
            </button>
          </div>
        </div>
      ),
      placement: isMobile ? 'bottom' : 'right'
    },
    {
      target: prefix + 'tutorial-bossrush',
      title: '💀 Теневой Натиск',
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/80 leading-relaxed">
            Новый высокоуровневый эндгейм-режим! Соберите 3 независимых отряда и сразитесь с серией свирепых Мега-Боссов за эксклюзивные награды.
          </p>
          <div className="mt-1 pt-2 border-t border-white/10 flex flex-col gap-1.5">
            <span className="text-[11px] text-fuchsia-400 font-medium">💡 Готовы проверить силы в эндгейме?</span>
            <button
              type="button"
              onClick={() => jumpToSection(() => setRoute('BOSS_RUSH_MENU'))}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-fuchsia-600/20"
            >
              <span>💀 В Теневой Натиск</span>
            </button>
          </div>
        </div>
      ),
      placement: isMobile ? 'bottom' : 'right'
    },
    {
      target: prefix + 'tutorial-dungeons',
      title: '⚔️ Подземелья',
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/80 leading-relaxed">
            Фарм Моры, Опыта Героя и наборов легендарных Артефактов. Проходите этажи для усиления ваших бойцов.
          </p>
          <div className="mt-1 pt-2 border-t border-white/10 flex flex-col gap-1.5">
            <span className="text-[11px] text-blue-400 font-medium">💡 Попробуйте заглянуть в данжи:</span>
            <button
              type="button"
              onClick={() => jumpToSection(() => setActiveTab('DUNGEONS'))}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-600/20"
            >
              <span>🛡️ Открыть Подземелья</span>
            </button>
          </div>
        </div>
      ),
      placement: isMobile ? 'bottom' : 'right'
    },
    {
      target: prefix + 'tutorial-dailies',
      title: '📋 Поручения',
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/80 leading-relaxed">
            Список ежедневных заданий. Выполняйте их каждый день, чтобы стабильно получать Камни Истока и опыт приключений!
          </p>
          <div className="mt-1 pt-2 border-t border-white/10 flex flex-col gap-1.5">
            <span className="text-[11px] text-emerald-400 font-medium">💡 Загляните за сегодняшними заданиями:</span>
            <button
              type="button"
              onClick={() => jumpToSection(() => setActiveTab('DAILIES'))}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-600/20"
            >
              <span>✅ К Поручениям</span>
            </button>
          </div>
        </div>
      ),
      placement: isMobile ? 'bottom' : 'right'
    },
    {
      target: prefix + 'tutorial-expeditions',
      title: '🧭 Экспедиции',
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/80 leading-relaxed">
            Отправляйте незанятых персонажей на задания по сбору руды, трав и золота. Ресурсы копятся даже тогда, когда вы не в игре!
          </p>
          <div className="mt-1 pt-2 border-t border-white/10 flex flex-col gap-1.5">
            <span className="text-[11px] text-orange-400 font-medium">💡 Запустите первую экспедицию прямо сейчас:</span>
            <button
              type="button"
              onClick={() => jumpToSection(() => setActiveTab('EXPEDITIONS'))}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-orange-500/20"
            >
              <span>⏳ В Экспедиции</span>
            </button>
          </div>
        </div>
      ),
      placement: isMobile ? 'bottom' : 'right'
    },
    {
      target: prefix + 'tutorial-events',
      title: '📅 События',
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/80 leading-relaxed">
            Здесь размещаются ограниченные по времени праздники, бонусные ивенты и расписание сезонных активностей. Доступно периодически.
          </p>
          <p className="text-[11px] text-white/50 italic mt-0.5">
            (В данный момент переходить сюда не обязательно, продолжайте знакомство с меню).
          </p>
        </div>
      ),
      placement: isMobile ? 'bottom' : 'right'
    },
    {
      target: prefix + 'tutorial-achievements',
      title: '🏆 Достижения',
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/80 leading-relaxed">
            Коллекция игровых подвигов! Побеждайте врагов, улучшайте отряд и открывайте скрытые ачивки с щедрыми наградами в гемах.
          </p>
          <div className="mt-1 pt-2 border-t border-white/10 flex flex-col gap-1.5">
            <span className="text-[11px] text-yellow-400 font-medium">💡 Проверьте, какие награды уже можно забрать:</span>
            <button
              type="button"
              onClick={() => jumpToSection(() => setActiveTab('ACHIEVEMENTS'))}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black text-xs font-bold rounded-xl transition shadow-lg shadow-yellow-500/20"
            >
              <span>⭐ Открыть Достижения</span>
            </button>
          </div>
        </div>
      ),
      placement: isMobile ? 'bottom' : 'right'
    },
    {
      target: prefix + 'tutorial-shop',
      title: '🎁 Магазин обмена',
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/80 leading-relaxed">
            Обменивайте добытые ресурсы и валюту на судьбоносные крутки, материалы возвышения и редкие предметы.
          </p>
          <div className="mt-1 pt-2 border-t border-white/10 flex flex-col gap-1.5">
            <span className="text-[11px] text-pink-400 font-medium">💡 Загляните за полезными покупками:</span>
            <button
              type="button"
              onClick={() => jumpToSection(() => setActiveTab('SHOP'))}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-pink-600 hover:bg-pink-500 active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-pink-600/20"
            >
              <span>🛍️ Открыть Магазин</span>
            </button>
          </div>
        </div>
      ),
      placement: isMobile ? 'bottom' : 'right'
    },
    {
      target: prefix + 'tutorial-roster',
      title: '👥 Отряд и Герои',
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/80 leading-relaxed">
            Сердце вашей боевой мощи! Повышайте уровень персонажей, снаряжайте артефакты, прокачивайте навыки и открывайте созвездия.
          </p>
          <div className="mt-1 pt-2 border-t border-white/10 flex flex-col gap-1.5">
            <span className="text-[11px] text-cyan-400 font-medium">💡 Настройте свою боевую команду:</span>
            <button
              type="button"
              onClick={() => jumpToSection(() => setRoute('ROSTER'))}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-cyan-600/20"
            >
              <span>👥 Перейти в Отряд</span>
            </button>
          </div>
        </div>
      ),
      placement: isMobile ? 'top' : 'right'
    },
    {
      target: prefix + 'tutorial-gacha',
      title: '✨ Молитвы (Призыв)',
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/80 leading-relaxed">
            Испытайте благосклонность удачи! Призывайте новых легендарных героев S-ранга и редких спутников в свою коллекцию.
          </p>
          <div className="mt-1 pt-2 border-t border-white/10 flex flex-col gap-1.5">
            <span className="text-[11px] text-amber-400 font-medium">💡 Попробуйте совершить крутку:</span>
            <button
              type="button"
              onClick={() => jumpToSection(() => setRoute('GACHA'))}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black text-xs font-bold rounded-xl transition shadow-lg shadow-amber-500/20"
            >
              <span>⭐ В Молитвы</span>
            </button>
          </div>
        </div>
      ),
      placement: isMobile ? 'top' : 'right'
    },
    {
      target: prefix + 'tutorial-bp',
      title: '🎟️ Бравл Пасс',
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/80 leading-relaxed">
            Сезонный боевой пропуск. Выполняйте игровые активности, повышайте уровень пропуска и забирайте горы ценных наград!
          </p>
          <div className="mt-1 pt-2 border-t border-white/10 flex flex-col gap-1.5">
            <span className="text-[11px] text-pink-400 font-medium">💡 Ознакомьтесь с призами текущего сезона:</span>
            <button
              type="button"
              onClick={() => jumpToSection(() => setRoute('BP'))}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-pink-600 hover:bg-pink-500 active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-pink-600/20"
            >
              <span>🎁 Открыть Пасс</span>
            </button>
          </div>
        </div>
      ),
      placement: isMobile ? 'top' : 'right'
    },
    {
      target: prefix + 'tutorial-abyss',
      title: '🌀 Витая Бездна',
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/80 leading-relaxed">
            Глубокие этажи с усиленными монстрами и боссами. Чем глубже вы спуститесь, тем грандиознее трофеи и звания!
          </p>
          <div className="mt-1 pt-2 border-t border-white/10 flex flex-col gap-1.5">
            <span className="text-[11px] text-purple-400 font-medium">💡 Бросьте вызов опасным этажам:</span>
            <button
              type="button"
              onClick={() => jumpToSection(() => setRoute('ABYSS'))}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-purple-600/20"
            >
              <span>🌀 Войти в Бездну</span>
            </button>
          </div>
        </div>
      ),
      placement: isMobile ? 'top' : 'right'
    },
    {
      target: prefix + 'tutorial-meta',
      title: '📚 Мета-гайд',
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/80 leading-relaxed">
            Справочник по синергиям, лучшим билдам персонажей, тир-листам и оптимальным ротациям навыков для легких побед.
          </p>
          <div className="mt-1 pt-2 border-t border-white/10 flex flex-col gap-1.5">
            <span className="text-[11px] text-yellow-400 font-medium">💡 Изучите советы по развитию:</span>
            <button
              type="button"
              onClick={() => jumpToSection(() => setRoute('META'))}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black text-xs font-bold rounded-xl transition shadow-lg shadow-yellow-500/20"
            >
              <span>📖 Открыть Гайд</span>
            </button>
          </div>
        </div>
      ),
      placement: isMobile ? 'top' : 'right'
    }
  ];

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem('tutorial_completed_v3', 'true');
      setShowTutorial(false);
      updateProfile(p => ({ ...p, tutorialCompleted: true }));
    }
  };`;

// Replace from const [showTutorial, setShowTutorial] down to end of handleJoyrideCallback
const regexTutorial = /const \[showTutorial, setShowTutorial\] = useState\(false\);[\s\S]*?const handleJoyrideCallback = \(data: EventData\) => \{[\s\S]*?updateProfile\(p => \(\{ \.\.\.p, tutorialCompleted: true \}\)\);\s*\}\s*;/;

if (!regexTutorial.test(code)) {
  console.error("Could not match regexTutorial!");
  process.exit(1);
}

code = code.replace(regexTutorial, tutorialSetupCode);

fs.writeFileSync('src/components/HubMenu.tsx', code);
console.log("Replaced tutorial setup successfully!");
