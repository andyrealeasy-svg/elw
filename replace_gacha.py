import re

with open('src/components/HubMenu.tsx', 'r') as f:
    content = f.read()

# Replace Desktop Sidebar Nav
desktop_nav_pattern = r'            \{\/\* Активности \*\/\}[\s\S]*?            <\/button>\n         <\/nav>'
new_desktop_nav = """            {/* Активности */}
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

            <div className="my-2 border-t border-white/5"></div>
            
            <button onClick={() => setRoute('GACHA')} className="desk-tutorial-gacha w-full flex items-center gap-3 p-2.5 rounded-xl font-bold hover:bg-[#1a1a1a]/50 text-amber-400 transition-colors">
               <Star className="w-4 h-4" /> <span className="text-sm">Молитвы</span>
            </button>

            <div className="my-2 border-t border-white/5"></div>

            {/* Прогресс */}
            <div className="mt-1">
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
         </nav>"""

content = re.sub(desktop_nav_pattern, new_desktop_nav, content, flags=re.DOTALL)

# Replace Mobile Drawer Nav
mobile_nav_pattern = r'               \{\/\* Активности \*\/\}[\s\S]*?               \{\/\* Вне категории: Молитвы \*\/\}[\s\S]*?               <\/div>\n               \{onLogout && \('
new_mobile_nav = """               {/* Активности */}
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

               {/* Молитвы */}
               <div>
                  <button 
                     onClick={() => { setRoute('GACHA'); setMenuOpen(false); }}
                     className="mob-tutorial-gacha flex items-center justify-start p-3 rounded-2xl border-2 border-white/5 bg-[#111111]/40 hover:bg-[#111111] transition-all gap-3 text-left w-full text-amber-400"
                  >
                     <Star className="w-5 h-5" />
                     <span className="text-xs font-bold font-mono">Молитвы</span>
                  </button>
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
               {onLogout && ("""

content = re.sub(mobile_nav_pattern, new_mobile_nav, content, flags=re.DOTALL)

with open('src/components/HubMenu.tsx', 'w') as f:
    f.write(content)

print("Replaced gacha position!")
