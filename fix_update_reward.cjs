const fs = require('fs');
let code = fs.readFileSync('src/components/EventsMenu.tsx', 'utf8');

const regex = /\{\/\* UPDATE REWARD \*\/\}[\s\S]*?(?=\{\/\* LOGIN \*\/\}|\Z)/;

const newUpdateTab = `
        {/* UPDATE REWARD */}
        {subTab === 'UPDATE' && (
          <div className="flex flex-col items-center justify-center h-full w-full max-w-lg mx-auto">
            <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center">
              <h2 className="text-xl font-bold text-white mb-2">Обновление 1.2</h2>
              <p className="text-sm text-white/50 mb-8">Слияние Миров успешно завершено. Благодарим за участие.</p>
              
              <div className="flex items-center gap-2 mb-8 bg-white/5 px-6 py-3 rounded-xl border border-white/10">
                 <span className="text-xl">💎</span>
                 <span className="text-lg font-bold text-white tracking-widest">800</span>
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
                className={cn(
                  "w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition", 
                  profile.events?.update12Claimed ? "bg-white/5 text-white/30" : "bg-white text-black hover:bg-white/90"
                )}
              >
                {profile.events?.update12Claimed ? "Получено" : "Получить"}
              </button>
            </div>
          </div>
        )}
`;

code = code.replace(regex, newUpdateTab + "\n");
fs.writeFileSync('src/components/EventsMenu.tsx', code);
