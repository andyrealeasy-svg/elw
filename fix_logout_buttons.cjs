const fs = require('fs');
let code = fs.readFileSync('src/components/HubMenu.tsx', 'utf-8');

// Desktop
const oldDesktop = `            <button onClick={() => setRoute('BP')} className="flex items-center gap-3 p-3 rounded-xl font-bold hover:bg-[#1a1a1a]/50 text-white/50 transition-colors">
               <Gift className="w-5 h-5" /> Бравл Пасс
            </button>
         </nav>
      </div>`;

const newDesktop = `            <button onClick={() => setRoute('BP')} className="flex items-center gap-3 p-3 rounded-xl font-bold hover:bg-[#1a1a1a]/50 text-white/50 transition-colors">
               <Gift className="w-5 h-5" /> Бравл Пасс
            </button>
         </nav>
         {onLogout && (
           <div className="p-4 border-t border-white/5">
              <button onClick={onLogout} className="flex items-center gap-3 p-3 w-full rounded-xl font-bold hover:bg-red-500/20 text-red-400 transition-colors">
                 <X className="w-5 h-5" /> Выйти
              </button>
           </div>
         )}
      </div>`;

// Mobile
const oldMobile = `                  <button 
                     onClick={() => { setRoute('META'); setMenuOpen(false); }}
                     className="flex flex-col items-center justify-center py-2.5 px-1 bg-[#111111] border border-white/5 hover:bg-[#1a1a1a] active:scale-95 transition rounded-2xl text-white/70"
                  >
                     <Trophy className="w-4 h-4 mb-1 text-yellow-400" />
                     <span className="text-[10px] font-bold truncate">Мета</span>
                  </button>
               </div>
            </div>
         </div>
      )}`;

const newMobile = `                  <button 
                     onClick={() => { setRoute('META'); setMenuOpen(false); }}
                     className="flex flex-col items-center justify-center py-2.5 px-1 bg-[#111111] border border-white/5 hover:bg-[#1a1a1a] active:scale-95 transition rounded-2xl text-white/70"
                  >
                     <Trophy className="w-4 h-4 mb-1 text-yellow-400" />
                     <span className="text-[10px] font-bold truncate">Мета</span>
                  </button>
               </div>
               {onLogout && (
                  <button 
                     onClick={() => { onLogout(); setMenuOpen(false); }}
                     className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-[#111111] border border-red-500/20 hover:bg-red-500/10 active:scale-95 transition rounded-2xl text-red-400 font-bold text-xs uppercase tracking-widest"
                  >
                     <X className="w-4 h-4" /> Выйти из аккаунта
                  </button>
               )}
            </div>
         </div>
      )}`;

code = code.replace(oldDesktop, newDesktop);
code = code.replace(oldMobile, newMobile);
fs.writeFileSync('src/components/HubMenu.tsx', code);
console.log('Success');
