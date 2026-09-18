import re

with open('src/components/BossRushMenu.tsx', 'r') as f:
    content = f.read()

old_header_pattern = r'<div className="flex-none p-6 pb-2 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md relative z-20">[\s\S]*?</button>\s*</div>'

new_header = """<div className="flex-none p-6 pb-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between bg-black/40 backdrop-blur-md relative z-20 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors shrink-0">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black uppercase italic tracking-wider flex items-center gap-2 text-white">
                <Skull className="w-6 h-6 text-fuchsia-500" /> Теневой Натиск: Сезон 2
              </h1>
            </div>
            <p className="text-xs text-white/50 font-medium">
              Соберите 3 уникальных отряда для 3 боссов
            </p>
          </div>
        </div>
        <button 
          onClick={() => isReady && onStartRush(teams)}
          disabled={!isReady}
          className="px-6 py-3 sm:py-2 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-[#1a1a1a] disabled:text-white/40 text-white font-bold rounded-xl tracking-widest uppercase transition-all shadow-lg shadow-fuchsia-600/20 shrink-0 w-full sm:w-auto"
        >
          Начать испытание
        </button>
      </div>

      {/* Блок наград */}
      <div className="bg-[#111111]/80 backdrop-blur-sm border-b border-white/5 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between z-10 shrink-0 gap-3">
         <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm font-bold text-white/80 uppercase tracking-wider">Награды за сезон:</span>
            {profile.bossRushSeason2Claimed ? (
               <div className="flex items-center gap-2 flex-wrap">
                 <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                   ✓ Получено
                 </span>
                 <span className="text-[10px] sm:text-xs text-white/40">Награды за сезон уже собраны. Базовый опыт и золото.</span>
               </div>
            ) : (
               <div className="flex items-center gap-2 flex-wrap">
                 <span className="text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20 flex items-center gap-1.5">
                   💎 1200 Гемов
                 </span>
                 <span className="text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-1.5">
                   🛡️ 10x 5★ (Песнь Океана / Зима)
                 </span>
               </div>
            )}
         </div>
      </div>"""

if re.search(old_header_pattern, content):
    content = re.sub(old_header_pattern, new_header, content)
    with open('src/components/BossRushMenu.tsx', 'w') as f:
        f.write(content)
    print("Replaced header successfully")
else:
    print("Could not find header pattern")
