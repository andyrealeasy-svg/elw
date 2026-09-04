const fs = require('fs');
let code = fs.readFileSync('src/components/EventsMenu.tsx', 'utf8');

// Add UPDATE to subTab state
code = code.replace(
  "const [subTab, setSubTab] = useState<'LOGIN' | 'AVELINE' | 'GRID' | 'FRONTIER' | 'TESTRUN' | 'MINIGAME'>('AVELINE');",
  "const [subTab, setSubTab] = useState<'LOGIN' | 'AVELINE' | 'GRID' | 'FRONTIER' | 'TESTRUN' | 'MINIGAME' | 'UPDATE'>('AVELINE');"
);

// Add UPDATE tab button to sidebar
const updateButton = `
        <div className="h-px bg-white/10 w-full my-2"></div>
        <button onClick={() => setSubTab('UPDATE')} className={cn("flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition shrink-0", subTab === 'UPDATE' ? "bg-cyan-600 text-white" : "text-white/50 hover:bg-[#1a1a1a]/50")}>
          <Gift className="w-4 h-4" /> Обновление 1.2
        </button>
`;
code = code.replace(
  '<div className="h-px bg-white/10 w-full my-2"></div>\n        <button onClick={() => setSubTab(\'LOGIN\')}',
  updateButton + '\n        <button onClick={() => setSubTab(\'LOGIN\')}'
);

// Add UPDATE tab content at the bottom, just before LOGIN or at the very end
const updateTabContent = `
        {/* UPDATE REWARD */}
        {subTab === 'UPDATE' && (
          <div className="bg-[#111111] border border-cyan-900/30 rounded-3xl p-6 sm:p-8 space-y-6 max-w-2xl mx-auto shadow-[0_0_50px_rgba(8,145,178,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none" />
            <h2 className="text-2xl sm:text-3xl font-black text-cyan-400 uppercase tracking-tight flex items-center gap-3 relative z-10">
              <Gift className="w-8 h-8" /> Релиз Версии 1.2
            </h2>
            <p className="text-sm text-white/60 relative z-10">
              Спасибо, что остаетесь с нами! В честь выхода обновления 1.2 "Слияние Миров" мы дарим всем игрокам специальную награду.
            </p>
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center">
                 <div className="w-24 h-24 rounded-full bg-cyan-950/50 border-2 border-cyan-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] mb-4 animate-bounce">
                    <span className="text-5xl">💎</span>
                 </div>
                 <span className="text-3xl font-black text-white">800 Гемов</span>
              </div>
            </div>
            
            <button 
              onClick={() => {
                if (!profile.events?.update12Claimed) {
                  updateProfile(p => ({
                    ...p, gems: p.gems + 800, events: { ...p.events, update12Claimed: true }
                  }));
                }
              }} 
              disabled={profile.events?.update12Claimed} 
              className={cn("w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex justify-center gap-2 relative z-10 transition", profile.events?.update12Claimed ? "bg-[#1a1a1a] text-white/30 border border-white/5" : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]")}
            >
              {profile.events?.update12Claimed ? "Награда Получена" : "Забрать Награду"}
            </button>
          </div>
        )}
`;

code = code.replace(
  "{/* LOGIN */}",
  updateTabContent + "\n\n        {/* LOGIN */}"
);

fs.writeFileSync('src/components/EventsMenu.tsx', code);
