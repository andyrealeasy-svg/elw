import re

with open('src/components/HubMenu.tsx', 'r') as f:
    content = f.read()

# Replace Desktop Sidebar Nav
desktop_nav_pattern = r'<nav className="flex-1 flex flex-col gap-2 p-4">.*?</nav>'
new_desktop_nav = """<nav className="flex-1 flex flex-col gap-1.5 p-4 pb-20">
            {/* Быстрый доступ (4 кнопки) */}
            <div className="grid grid-cols-2 gap-2 mb-4">
               <button onClick={() => setActiveTab('OVERVIEW')} className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl font-bold transition-colors ${activeTab === 'OVERVIEW' ? 'bg-[#1a1a1a] text-white' : 'hover:bg-[#1a1a1a]/50 text-white/50 bg-[#111111] border border-white/5'}`}>
                  <Compass className="w-5 h-5" /> <span className="text-[10px] uppercase">Главная</span>
               </button>
               <button onClick={() => setRoute('ROSTER')} className="desk-tutorial-roster flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl font-bold hover:bg-[#1a1a1a]/50 text-white/50 bg-[#111111] border border-white/5 transition-colors">
                  <Users className="w-5 h-5" /> <span className="text-[10px] uppercase">Отряд</span>
               </button>
               <button onClick={() => setActiveTab('DAILIES')} className={`desk-tutorial-dailies flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl font-bold transition-colors ${activeTab === 'DAILIES' ? 'bg-[#1a1a1a] text-green-400' : 'hover:bg-[#1a1a1a]/50 text-white/50 bg-[#111111] border border-white/5'}`}>
                  <CheckCircle className="w-5 h-5" /> <span className="text-[10px] uppercase">Поручения</span>
               </button>
               <button onClick={() => setActiveTab('DUNGEONS')} className={`desk-tutorial-dungeons flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl font-bold transition-colors ${activeTab === 'DUNGEONS' ? 'bg-[#1a1a1a] text-blue-400' : 'hover:bg-[#1a1a1a]/50 text-white/50 bg-[#111111] border border-white/5'}`}>
                  <Swords className="w-5 h-5" /> <span className="text-[10px] uppercase">Данжи</span>
               </button>
            </div>

            {/* Путешествие */}
            <div className="mt-1">
               <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5 px-2">Путешествие</h3>
               <button onClick={() => setRoute('STORY')} className="desk-tutorial-story w-full flex items-center gap-3 p-2.5 rounded-xl font-bold hover:bg-[#1a1a1a]/50 text-amber-500 transition-colors">
                  <Book className="w-4 h-4" /> <span className="text-sm">Сюжет</span>
               </button>
               <button onClick={() => setRoute('MAP')} className="desk-tutorial-map w-full flex items-center gap-3 p-2.5 rounded-xl font-bold hover:bg-[#1a1a1a]/50 text-indigo-400 transition-colors">
                  <Globe className="w-4 h-4 animate-spin-slow" /> <span className="text-sm">Карта мира</span>
               </button>
            </div>

            {/* Бой */}
            <div className="mt-3">
               <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5 px-2">Бой</h3>
               <button onClick={() => setRoute('ROSTER')} className="desk-tutorial-roster w-full flex items-center gap-3 p-2.5 rounded-xl font-bold hover:bg-[#1a1a1a]/50 text-white/70 transition-colors">
                  <Users className="w-4 h-4" /> <span className="text-sm">Отряд ({Object.keys(profile.roster).length})</span>
               </button>
               <button onClick={() => setActiveTab('DUNGEONS')} className={`desk-tutorial-dungeons w-full flex items-center gap-3 p-2.5 rounded-xl font-bold transition-colors ${activeTab === 'DUNGEONS' ? 'bg-[#1a1a1a] text-blue-400' : 'hover:bg-[#1a1a1a]/50 text-white/70'}`}>
                  <Swords className="w-4 h-4" /> <span className="text-sm">Подземелья</span>
               </button>
               <button onClick={() => setRoute('ABYSS')} className="desk-tutorial-abyss w-full flex items-center gap-3 p-2.5 rounded-xl font-bold hover:bg-[#1a1a1a]/50 text-purple-400 transition-colors">
                  <Layers className="w-4 h-4" /> <span className="text-sm">Бездна</span>
               </button>
               <button onClick={() => setRoute('BOSS_RUSH_MENU')} className="desk-tutorial-bossrush w-full flex items-center gap-3 p-2.5 rounded-xl font-bold hover:bg-fuchsia-950/40 text-fuchsia-300 transition-colors">
                  <Skull className="w-4 h-4" /> <span className="text-sm">Теневой Натиск</span>
               </button>
            </div>

            {/* Активности */}
            <div className="mt-3">
               <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5 px-2">Активности</h3>
               <button onClick={() => setActiveTab('DAILIES')} className={`desk-tutorial-dailies w-full flex items-center gap-3 p-2.5 rounded-xl font-bold transition-colors ${activeTab === 'DAILIES' ? 'bg-[#1a1a1a] text-green-400' : 'hover:bg-[#1a1a1a]/50 text-white/70'}`}>
                  <CheckCircle className="w-4 h-4" /> <span className="text-sm">Поручения</span>
               </button>
               <button onClick={() => setActiveTab('EXPEDITIONS')} className={`desk-tutorial-expeditions w-full flex items-center gap-3 p-2.5 rounded-xl font-bold transition-colors ${activeTab === 'EXPEDITIONS' ? 'bg-[#1a1a1a] text-orange-400' : 'hover:bg-[#1a1a1a]/50 text-white/70'}`}>
                  <Map className="w-4 h-4" /> <span className="text-sm">Экспедиции</span>
               </button>
               <button onClick={() => setActiveTab('EVENTS')} className={`desk-tutorial-events w-full flex items-center gap-3 p-2.5 rounded-xl font-bold transition-colors ${activeTab === 'EVENTS' ? 'bg-[#1a1a1a] text-purple-400' : 'hover:bg-[#1a1a1a]/50 text-white/70'}`}>
                  <Calendar className="w-4 h-4" /> <span className="text-sm">События</span>
               </button>
            </div>

            {/* Прогресс */}
            <div className="mt-3">
               <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5 px-2">Прогресс</h3>
               <button onClick={() => setActiveTab('SHOP')} className={`desk-tutorial-shop w-full flex items-center gap-3 p-2.5 rounded-xl font-bold transition-colors ${activeTab === 'SHOP' ? 'bg-[#1a1a1a] text-pink-400' : 'hover:bg-[#1a1a1a]/50 text-white/70'}`}>
                  <Gift className="w-4 h-4" /> <span className="text-sm">Магазин обмена</span>
               </button>
               <button onClick={() => setActiveTab('ACHIEVEMENTS')} className={`desk-tutorial-achievements w-full flex items-center gap-3 p-2.5 rounded-xl font-bold transition-colors ${activeTab === 'ACHIEVEMENTS' ? 'bg-[#1a1a1a] text-yellow-400' : 'hover:bg-[#1a1a1a]/50 text-white/70'}`}>
                  <Star className="w-4 h-4" /> <span className="text-sm">Достижения</span>
               </button>
               <button onClick={() => setRoute('BP')} className="desk-tutorial-bp w-full flex items-center gap-3 p-2.5 rounded-xl font-bold hover:bg-[#1a1a1a]/50 text-white/70 transition-colors">
                  <Gift className="w-4 h-4" /> <span className="text-sm">Бравл Пасс</span>
               </button>
               <button onClick={() => setRoute('META')} className="desk-tutorial-meta w-full flex items-center gap-3 p-2.5 rounded-xl font-bold hover:bg-[#1a1a1a]/50 text-white/70 group transition-colors">
                  <Trophy className="w-4 h-4 group-hover:rotate-12 transition-transform" /> <span className="text-sm">Мета-гайд</span>
               </button>
            </div>

            <div className="my-3 border-t border-white/5"></div>

            <button onClick={() => setRoute('GACHA')} className="desk-tutorial-gacha w-full flex items-center gap-3 p-3 rounded-xl font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors">
               <Star className="w-5 h-5" /> <span>Молитвы</span>
            </button>
         </nav>"""

content = re.sub(desktop_nav_pattern, new_desktop_nav, content, flags=re.DOTALL)

# Replace Mobile Drawer Nav
mobile_nav_pattern = r'            \{\/\* Unified Scrollable Drawer Container \*\/\}[\s\S]*?                  <\/div>\n               \)\}\n               <\/div>\n'
new_mobile_nav = """            {/* Unified Scrollable Drawer Container */}
            <div className="flex-1 overflow-y-auto pr-1 pb-6 space-y-6">
               
               {/* Быстрый доступ (4 кнопки) */}
               <div className="grid grid-cols-4 gap-2">
                  <button 
                     onClick={() => { setActiveTab('OVERVIEW'); setMenuOpen(false); }}
                     className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1.5 text-center ${
                        activeTab === 'OVERVIEW' 
                           ? 'border-blue-500/50 bg-blue-500/10 text-white' 
                           : 'border-white/5 bg-[#111111]/40 text-white/50 hover:bg-[#111111]'
                     }`}
                  >
                     <Compass className="w-5 h-5 text-blue-400" />
                     <span className="text-[9px] font-bold font-mono">Главная</span>
                  </button>
                  <button 
                     onClick={() => { setRoute('ROSTER'); setMenuOpen(false); }}
                     className="mob-tutorial-roster flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-white/5 bg-[#111111]/40 text-white/50 hover:bg-[#111111] transition-all gap-1.5 text-center"
                  >
                     <Users className="w-5 h-5" />
                     <span className="text-[9px] font-bold font-mono">Отряд</span>
                  </button>
                  <button 
                     onClick={() => { setActiveTab('DAILIES'); setMenuOpen(false); }}
                     className={`mob-tutorial-dailies flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1.5 text-center ${
                        activeTab === 'DAILIES' 
                           ? 'border-green-500/50 bg-green-500/10 text-white' 
                           : 'border-white/5 bg-[#111111]/40 text-white/50 hover:bg-[#111111]'
                     }`}
                  >
                     <CheckCircle className="w-5 h-5 text-green-400" />
                     <span className="text-[9px] font-bold font-mono">Поручения</span>
                  </button>
                  <button 
                     onClick={() => { setActiveTab('DUNGEONS'); setMenuOpen(false); }}
                     className={`mob-tutorial-dungeons flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1.5 text-center ${
                        activeTab === 'DUNGEONS' 
                           ? 'border-blue-500/50 bg-blue-500/10 text-white' 
                           : 'border-white/5 bg-[#111111]/40 text-white/50 hover:bg-[#111111]'
                     }`}
                  >
                     <Swords className="w-5 h-5 text-blue-400" />
                     <span className="text-[9px] font-bold font-mono">Данжи</span>
                  </button>
               </div>

               {/* Путешествие */}
               <div>
                  <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-3 px-1">Путешествие</h3>
                  <div className="grid grid-cols-2 gap-3">
                     <button 
                        onClick={() => { setRoute('STORY'); setMenuOpen(false); }}
                        className="mob-tutorial-story flex items-center justify-start p-3 rounded-2xl border-2 border-white/5 bg-[#111111]/40 hover:bg-[#111111] transition-all gap-3 text-left"
                     >
                        <Book className="w-5 h-5 text-amber-500" />
                        <span className="text-xs font-bold font-mono text-amber-400">Сюжет</span>
                     </button>
                     <button 
                        onClick={() => { setRoute('MAP'); setMenuOpen(false); }}
                        className="mob-tutorial-map flex items-center justify-start p-3 rounded-2xl border-2 border-white/5 bg-[#111111]/40 hover:bg-[#111111] transition-all gap-3 text-left"
                     >
                        <Globe className="w-5 h-5 text-indigo-400 animate-spin-slow" />
                        <span className="text-xs font-bold font-mono text-indigo-400">Карта мира</span>
                     </button>
                  </div>
               </div>

               {/* Бой */}
               <div>
                  <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-3 px-1">Бой</h3>
                  <div className="grid grid-cols-2 gap-3">
                     <button 
                        onClick={() => { setRoute('ROSTER'); setMenuOpen(false); }}
                        className="mob-tutorial-roster flex items-center justify-start p-3 rounded-2xl border-2 border-white/5 bg-[#111111]/40 hover:bg-[#111111] transition-all gap-3 text-left text-white/70"
                     >
                        <Users className="w-5 h-5" />
                        <span className="text-xs font-bold font-mono">Отряд</span>
                     </button>
                     <button 
                        onClick={() => { setActiveTab('DUNGEONS'); setMenuOpen(false); }}
                        className={`mob-tutorial-dungeons flex items-center justify-start p-3 rounded-2xl border-2 transition-all gap-3 text-left ${
                           activeTab === 'DUNGEONS' 
                              ? 'border-blue-500/50 bg-blue-500/10 text-white' 
                              : 'border-white/5 bg-[#111111]/40 text-white/70 hover:bg-[#111111]'
                        }`}
                     >
                        <Swords className="w-5 h-5 text-blue-400" />
                        <span className="text-xs font-bold font-mono">Подземелья</span>
                     </button>
                     <button 
                        onClick={() => { setRoute('ABYSS'); setMenuOpen(false); }}
                        className="mob-tutorial-abyss flex items-center justify-start p-3 rounded-2xl border-2 border-white/5 bg-[#111111]/40 hover:bg-[#111111] transition-all gap-3 text-left text-purple-400"
                     >
                        <Layers className="w-5 h-5" />
                        <span className="text-xs font-bold font-mono">Бездна</span>
                     </button>
                     <button 
                        onClick={() => { setRoute('BOSS_RUSH_MENU'); setMenuOpen(false); }}
                        className="mob-tutorial-bossrush flex items-center justify-start p-3 rounded-2xl border-2 border-fuchsia-500/50 bg-fuchsia-950/40 text-fuchsia-300 hover:bg-fuchsia-900/50 transition-all gap-3 text-left"
                     >
                        <Skull className="w-5 h-5 text-fuchsia-400" />
                        <span className="text-xs font-bold font-mono text-fuchsia-200 truncate">Натиск</span>
                     </button>
                  </div>
               </div>

               {/* Активности */}
               <div>
                  <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-3 px-1">Активности</h3>
                  <div className="grid grid-cols-2 gap-3">
                     <button 
                        onClick={() => { setActiveTab('DAILIES'); setMenuOpen(false); }}
                        className={`mob-tutorial-dailies flex items-center justify-start p-3 rounded-2xl border-2 transition-all gap-3 text-left ${
                           activeTab === 'DAILIES' 
                              ? 'border-green-500/50 bg-green-500/10 text-white' 
                              : 'border-white/5 bg-[#111111]/40 text-white/70 hover:bg-[#111111]'
                        }`}
                     >
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-xs font-bold font-mono">Поручения</span>
                     </button>
                     <button 
                        onClick={() => { setActiveTab('EXPEDITIONS'); setMenuOpen(false); }}
                        className={`mob-tutorial-expeditions flex items-center justify-start p-3 rounded-2xl border-2 transition-all gap-3 text-left ${
                           activeTab === 'EXPEDITIONS' 
                              ? 'border-orange-500/50 bg-orange-500/10 text-white' 
                              : 'border-white/5 bg-[#111111]/40 text-white/70 hover:bg-[#111111]'
                        }`}
                     >
                        <Map className="w-5 h-5 text-orange-400" />
                        <span className="text-xs font-bold font-mono">Экспедиции</span>
                     </button>
                     <button 
                        onClick={() => { setActiveTab('EVENTS'); setMenuOpen(false); }}
                        className={`mob-tutorial-events flex items-center justify-start p-3 rounded-2xl border-2 transition-all gap-3 text-left col-span-2 ${
                           activeTab === 'EVENTS' 
                              ? 'border-purple-500/50 bg-purple-500/10 text-white' 
                              : 'border-white/5 bg-[#111111]/40 text-white/70 hover:bg-[#111111]'
                        }`}
                     >
                        <Calendar className="w-5 h-5 text-purple-400" />
                        <span className="text-xs font-bold font-mono">События</span>
                     </button>
                  </div>
               </div>

               {/* Прогресс */}
               <div>
                  <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-3 px-1">Прогресс</h3>
                  <div className="grid grid-cols-2 gap-3">
                     <button 
                        onClick={() => { setActiveTab('SHOP'); setMenuOpen(false); }}
                        className={`mob-tutorial-shop flex items-center justify-start p-3 rounded-2xl border-2 transition-all gap-3 text-left ${
                           activeTab === 'SHOP' 
                              ? 'border-pink-500/50 bg-pink-500/10 text-white' 
                              : 'border-white/5 bg-[#111111]/40 text-white/70 hover:bg-[#111111]'
                        }`}
                     >
                        <Gift className="w-5 h-5 text-pink-400" />
                        <span className="text-xs font-bold font-mono">Магазин</span>
                     </button>
                     <button 
                        onClick={() => { setActiveTab('ACHIEVEMENTS'); setMenuOpen(false); }}
                        className={`mob-tutorial-achievements flex items-center justify-start p-3 rounded-2xl border-2 transition-all gap-3 text-left ${
                           activeTab === 'ACHIEVEMENTS' 
                              ? 'border-yellow-500/50 bg-yellow-500/10 text-white' 
                              : 'border-white/5 bg-[#111111]/40 text-white/70 hover:bg-[#111111]'
                        }`}
                     >
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="text-xs font-bold font-mono">Достижения</span>
                     </button>
                     <button 
                        onClick={() => { setRoute('BP'); setMenuOpen(false); }}
                        className="mob-tutorial-bp flex items-center justify-start p-3 rounded-2xl border-2 border-white/5 bg-[#111111]/40 hover:bg-[#111111] transition-all gap-3 text-left text-white/70"
                     >
                        <Gift className="w-5 h-5" />
                        <span className="text-xs font-bold font-mono">Бравл Пасс</span>
                     </button>
                     <button 
                        onClick={() => { setRoute('META'); setMenuOpen(false); }}
                        className="mob-tutorial-meta flex items-center justify-start p-3 rounded-2xl border-2 border-white/5 bg-[#111111]/40 hover:bg-[#111111] transition-all gap-3 text-left text-white/70 group"
                     >
                        <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span className="text-xs font-bold font-mono">Мета-гайд</span>
                     </button>
                  </div>
               </div>

               {/* Вне категории: Молитвы */}
               <div className="pt-2">
                  <button 
                     onClick={() => { setRoute('GACHA'); setMenuOpen(false); }}
                     className="mob-tutorial-gacha flex flex-row items-center justify-center p-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl w-full gap-3 transition-colors active:scale-95 shadow-lg shadow-amber-900/20"
                  >
                     <Star className="w-6 h-6" />
                     <span className="text-sm font-bold uppercase tracking-widest">Молитвы</span>
                  </button>
               </div>
            </div>
"""

content = re.sub(mobile_nav_pattern, new_mobile_nav, content, flags=re.DOTALL)

with open('src/components/HubMenu.tsx', 'w') as f:
    f.write(content)

print("Replaced!")
