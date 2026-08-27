const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const startMarker = `      {currentRouteName === 'VICTORY' && (`;
const endMarker = `    </div>\n  );\n}`;

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Markers not found");
  process.exit(1);
}

const replacement = `      {currentRouteName === 'VICTORY' && (
        <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-6 w-full max-w-4xl mx-auto p-4 sm:p-6 pb-20">
          
          {bossRushResults && bossRushResults.length > 0 ? (
            /* ================= BOSS RUSH ALL 3 STAGES VICTORY SCREEN ================= */
            <div className="w-full space-y-6">
              <div className="flex flex-col items-center gap-3 text-center mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111111] border border-white/10 text-white/70 text-[10px] font-black uppercase tracking-widest">
                  <Crown className="w-3.5 h-3.5" />
                  Теневой Натиск: Завершен
                </div>
                <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-widest">
                  Триумф
                </h2>
                <p className="text-white/40 text-xs sm:text-sm font-mono tracking-widest uppercase">
                  Все 3 босса повержены без повторений
                </p>
              </div>

              {/* Loot banner */}
              {lastDrops && (
                <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 w-full text-left transition-colors hover:border-white/10">
                  <h3 className="font-bold text-[11px] text-white/70 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                    <Trophy className="w-4 h-4 text-white/50" /> Награды Операции
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center">
                       <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1.5">Опыт отряда</span>
                       <span className="font-black text-green-400 text-lg">+{lastDrops.exp.toLocaleString()}</span>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center">
                       <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1.5">Золото</span>
                       <span className="font-black text-yellow-400 text-lg">+{lastDrops.gold.toLocaleString()}</span>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center">
                       <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1.5">Кристаллы</span>
                       <span className="font-black text-pink-400 text-lg">+{lastDrops.gems} 💎</span>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center">
                       <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1.5">Артефакты</span>
                       <span className="font-black text-purple-400 text-lg">2x 5★</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Global Total Run Metrics */}
              {(() => {
                const totalDmg = bossRushResults.reduce((sum, r) => sum + r.totalDamage, 0);
                const totalSec = bossRushResults.reduce((sum, r) => sum + r.duration, 0);
                const allFighters = bossRushResults.flatMap(r =>
                  r.party.map(p => ({
                    name: p.name,
                    id: p.id,
                    element: p.element,
                    stageIdx: r.stage,
                    bossName: r.bossName,
                    damage: r.stats[p.uid] || 0
                  }))
                );
                const mvp = allFighters.length > 0 
                  ? allFighters.reduce((prev, curr) => curr.damage > prev.damage ? curr : prev, allFighters[0]) 
                  : null;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#111111] border border-white/5 rounded-3xl p-5 hover:border-white/10 transition-colors flex flex-col gap-1">
                      <div className="font-bold text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Swords className="w-3.5 h-3.5" /> Суммарный урон
                      </div>
                      <div className="text-2xl font-mono font-black text-white/90">
                        {Math.floor(totalDmg).toLocaleString()} <span className="text-xs text-white/40">DMG</span>
                      </div>
                    </div>
                    
                    <div className="bg-[#111111] border border-white/5 rounded-3xl p-5 hover:border-white/10 transition-colors flex flex-col gap-1">
                      <div className="font-bold text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Clock className="w-3.5 h-3.5" /> Общее время
                      </div>
                      <div className="text-2xl font-mono font-black text-white/90">
                        {totalSec.toFixed(1)} <span className="text-xs text-white/40">СЕК</span>
                      </div>
                    </div>

                    <div className="bg-[#111111] border border-white/5 rounded-3xl p-5 hover:border-white/10 transition-colors flex flex-col gap-1">
                      <div className="font-bold text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Crown className="w-3.5 h-3.5 text-white/70" /> MVP Натиска
                      </div>
                      {mvp && (
                        <div className="flex justify-between items-center mt-1">
                          <div className="flex items-center gap-3">
                            {getCharSplash(mvp.id) ? (
                               <img src={getCharSplash(mvp.id)!} alt={mvp.name} className="w-8 h-8 rounded-full object-cover border-2 border-white/10" referrerPolicy="no-referrer" />
                            ) : (
                               <div className="w-8 h-8 rounded-full bg-[#0a0a0a] border-2 border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">
                                 {mvp.name[0]}
                               </div>
                            )}
                            <span className="text-sm font-black text-white/90 truncate max-w-[90px] uppercase tracking-widest">{mvp.name}</span>
                          </div>
                          <span className="text-sm font-mono font-black text-white/70">{Math.floor(mvp.damage).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Tabs for Stage Breakdown */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-[#111111] border border-white/5 rounded-full w-fit mx-auto">
                <button
                  onClick={() => setBossRushTab('all')}
                  className={\`px-6 py-2 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest transition-all \${
                    bossRushTab === 'all' 
                      ? 'bg-white text-black shadow-md' 
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                  }\`}
                >
                  Обзор этапов
                </button>
                {bossRushResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setBossRushTab(i)}
                    className={\`px-6 py-2 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center gap-2 \${
                      bossRushTab === i 
                        ? 'bg-white text-black shadow-md' 
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    }\`}
                  >
                    Этап {i + 1}
                  </button>
                ))}
              </div>

              {bossRushTab === 'all' ? (
                <div className="grid grid-cols-1 gap-4">
                  {bossRushResults.map((stageRes, sIdx) => {
                    const maxPartyDmg = Math.max(1, ...stageRes.party.map(p => stageRes.stats[p.uid] || 0));
                    const stageDps = Math.floor(stageRes.totalDamage / stageRes.duration);
                    return (
                      <div key={sIdx} className="bg-[#111111] border border-white/5 rounded-3xl p-5 hover:border-white/10 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                          <div className="flex items-center gap-4">
                            <span className="w-10 h-10 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-sm font-black text-white/70">
                              {sIdx + 1}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white/90 uppercase tracking-widest">{stageRes.bossName}</span>
                              <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Босс побеждён</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-xs font-mono">
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] text-white/40 tracking-widest uppercase">Время</span>
                              <span className="font-bold text-white/90">{stageRes.duration.toFixed(1)}с</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] text-white/40 tracking-widest uppercase">DPS</span>
                              <span className="font-bold text-white/90">{stageDps.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] text-white/40 tracking-widest uppercase">Урон</span>
                              <span className="font-bold text-white/90">{Math.floor(stageRes.totalDamage).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Heroes bars */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {stageRes.party.map(hero => {
                            const heroDmg = stageRes.stats[hero.uid] || 0;
                            const pct = Math.max(2, (heroDmg / maxPartyDmg) * 100);
                            const sharePct = stageRes.totalDamage > 0 ? ((heroDmg / stageRes.totalDamage) * 100).toFixed(0) : '0';
                            const splash = getCharSplash(hero.id);
                            return (
                              <div key={hero.uid} className="bg-[#0a0a0a] p-3 rounded-2xl border border-white/5 flex flex-col gap-2">
                                <div className="flex justify-between items-center text-xs font-mono">
                                  <div className="flex items-center gap-2.5">
                                    {splash ? (
                                      <img src={splash} alt={hero.name} className="w-6 h-6 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center text-[9px] font-bold text-white/50">
                                        {hero.name[0]}
                                      </div>
                                    )}
                                    <span className="font-bold text-white/90 truncate max-w-[100px] uppercase tracking-widest">{hero.name}</span>
                                    <span className="text-[10px] text-white/40 font-bold tracking-widest">({sharePct}%)</span>
                                  </div>
                                  <span className="text-white/90 font-black">{Math.floor(heroDmg).toLocaleString()} DMG</span>
                                </div>
                                <div className="w-full bg-[#111111] h-1.5 rounded-full overflow-hidden border border-white/5">
                                  <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: \`\${pct}%\` }} 
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full bg-white/70 rounded-full" 
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Single Selected Stage Detailed View */
                (() => {
                  const stageRes = bossRushResults[bossRushTab as number];
                  if (!stageRes) return null;
                  const maxPartyDmg = Math.max(1, ...stageRes.party.map(p => stageRes.stats[p.uid] || 0));
                  const stageDps = Math.floor(stageRes.totalDamage / stageRes.duration);
                  return (
                    <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 text-left hover:border-white/10 transition-colors space-y-5">
                      <div className="flex flex-wrap justify-between items-center border-b border-white/5 pb-4">
                        <div className="flex flex-col gap-1">
                          <h3 className="font-bold text-lg text-white/90 uppercase tracking-widest">
                            {stageRes.stageTitle}
                          </h3>
                          <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase">
                            Время: {stageRes.duration.toFixed(1)}с • Общий урон: {Math.floor(stageRes.totalDamage).toLocaleString()} DMG
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Средний DPS</span>
                          <div className="text-xl font-mono font-black text-white/90">{stageDps.toLocaleString()}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {stageRes.party
                          .map(hero => ({ hero, dmg: stageRes.stats[hero.uid] || 0 }))
                          .sort((a, b) => b.dmg - a.dmg)
                          .map(({ hero, dmg }) => {
                            const pct = Math.max(2, (dmg / maxPartyDmg) * 100);
                            const sharePct = stageRes.totalDamage > 0 ? ((dmg / stageRes.totalDamage) * 100).toFixed(1) : '0';
                            const splash = getCharSplash(hero.id);
                            return (
                              <div key={hero.uid} className="bg-[#0a0a0a] p-4 rounded-2xl border border-white/5 flex flex-col gap-2.5">
                                <div className="flex justify-between items-center text-xs font-mono">
                                  <div className="flex items-center gap-3">
                                    {splash && (
                                      <img src={splash} alt={hero.name} className="w-8 h-8 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
                                    )}
                                    <div className="flex flex-col">
                                      <span className="text-sm font-bold text-white/90 uppercase tracking-widest">{hero.name}</span>
                                      <span className="text-[10px] text-white/40 tracking-widest uppercase">{hero.element}</span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <span className="text-white/90 font-black text-base">{Math.floor(dmg).toLocaleString()} DMG</span>
                                    <span className="text-[10px] text-white/40 tracking-widest uppercase">{sharePct}% отряда</span>
                                  </div>
                                </div>
                                <div className="w-full bg-[#111111] h-1.5 rounded-full overflow-hidden border border-white/5 mt-1">
                                  <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: \`\${pct}%\` }} 
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full bg-white/70 rounded-full" 
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          ) : (
            /* ================= STANDARD SINGLE BATTLE VICTORY SCREEN ================= */
            <>
              <div className="text-center mb-6 flex flex-col items-center gap-3">
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-widest">
                  Успех
                </h2>
                <div className="h-0.5 w-12 bg-white/20 mx-auto rounded-full" />
                <p className="text-white/40 font-mono text-[10px] sm:text-xs tracking-widest uppercase mt-2">
                  Боевая задача выполнена. Награды распределены.
                </p>
              </div>

              <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
                {/* Loot */}
                {lastDrops && (
                  <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 w-full text-left transition-colors hover:border-white/10">
                    <h3 className="text-[11px] font-bold text-white/70 uppercase tracking-widest border-b border-white/5 pb-4 mb-5 flex items-center gap-2">
                      <Package className="w-4 h-4 text-white/50" /> Контейнер ресурсов
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center">
                         <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1.5">Опыт героя</span>
                         <span className="font-black text-green-400 text-lg">+{lastDrops.exp}</span>
                      </div>
                      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center">
                         <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1.5">Золото</span>
                         <span className="font-black text-yellow-400 text-lg">+{lastDrops.gold}</span>
                      </div>
                      {lastDrops.gems > 0 && (
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center">
                           <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1.5">Кристаллы</span>
                           <span className="font-black text-pink-400 text-lg">+{lastDrops.gems} 💎</span>
                        </div>
                      )}
                    </div>
                    
                    {lastDrops.artifacts && lastDrops.artifacts.length > 0 && (
                      <div className="pt-5 mt-5 border-t border-white/5">
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-white/30" /> Найденные артефакты
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-2 no-scrollbar">
                          {lastDrops.artifacts.map((art, idx) => (
                            <div key={idx} className="bg-[#0a0a0a] p-3 rounded-2xl border border-white/5 flex justify-between items-center text-left">
                              <span className="text-xs text-white/70 font-bold truncate max-w-[140px] uppercase tracking-widest">{art.setName}</span>
                              <span className="font-black text-white/90 text-xs">+{art.mainStat.value} {art.mainStat.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Damage Statistics */}
                {lastDamageDealt && (
                  <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 w-full text-left transition-colors hover:border-white/10">
                    <div className="flex justify-between items-end border-b border-white/5 pb-4 mb-5">
                      <h3 className="text-[11px] font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
                        <Swords className="w-4 h-4 text-white/50" /> Анализ боя
                      </h3>
                      {lastDamageDealt.__duration && (
                        <div className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-widest flex flex-col items-end">
                          <span>Средний DPS</span>
                          <span className="text-white/90 text-sm mt-0.5">
                            {Math.floor(
                              Object.entries(lastDamageDealt)
                                .filter(([uid]) => (lastBattleParty.length > 0 ? lastBattleParty : playerParty).some(p => p.uid === uid) && uid !== '__duration')
                                .reduce((sum, [, d]) => sum + (d as number), 0) / 
                               (lastDamageDealt.__duration as number || 1)
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {Object.entries(lastDamageDealt)
                        .filter(([uid]) => (lastBattleParty.length > 0 ? lastBattleParty : playerParty).some(p => p.uid === uid) && uid !== '__duration')
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([uid, dmg]) => {
                          const activeParty = lastBattleParty.length > 0 ? lastBattleParty : playerParty;
                          const hero = activeParty.find(p => p.uid === uid);
                          const name = hero?.name || uid;
                          const splash = hero ? getCharSplash(hero.id) : null;
                          const playerStats = Object.entries(lastDamageDealt)
                            .filter(([u]) => activeParty.some(p => p.uid === u) && u !== '__duration')
                            .map(([, d]) => d as number);
                          const maxDmg = Math.max(1, ...playerStats);
                          const percent = Math.max(2, ((dmg as number) / maxDmg) * 100);
                          
                          return (
                            <div key={uid} className="flex flex-col gap-2">
                              <div className="flex justify-between items-center text-xs font-mono">
                                <div className="flex items-center gap-3">
                                  {splash ? (
                                    <img src={splash} alt={name} className="w-7 h-7 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">
                                      {name[0]}
                                    </div>
                                  )}
                                  <span className="text-white/90 font-bold tracking-widest uppercase">{name}</span>
                                </div>
                                <span className="text-white/90 font-black text-sm">{Math.floor(dmg as number).toLocaleString()} DMG</span>
                              </div>
                              <div className="w-full bg-[#0a0a0a] h-1.5 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                  initial={{ width: 0 }} 
                                  animate={{ width: \`\${percent}%\` }} 
                                  transition={{ duration: 1.2, ease: "easeOut" }}
                                  className="h-full bg-white/70 rounded-full" 
                                />
                              </div>
                            </div>
                          );
                        })}
                      {Object.entries(lastDamageDealt).filter(([uid]) => (lastBattleParty.length > 0 ? lastBattleParty : playerParty).some(p => p.uid === uid) && uid !== '__duration').length === 0 && (
                        <div className="text-white/40 text-[10px] font-mono tracking-widest uppercase text-center py-4 border border-dashed border-white/5 rounded-2xl bg-[#0a0a0a]/50">Урон не зафиксирован</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {lastStoryStage ? (
            <div className="flex flex-col items-center gap-5 w-full max-w-lg mt-6">
              <div className="text-[10px] font-mono text-white/70 bg-[#111111] border border-white/5 px-6 py-3 rounded-full uppercase tracking-widest">
                Сюжетный этап <span className="text-white font-bold mx-1">«{lastStoryStage.name}»</span> пройден
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                <button 
                  onClick={() => { setRoute('STORY'); setLastDamageDealt(null); setLastDrops(null); setLastStoryStage(null); }}
                  className="w-full sm:w-1/2 px-6 py-4 bg-white text-black font-black rounded-full font-mono uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-xs"
                >
                  <Book className="w-4 h-4" />
                  <span>К сюжету</span>
                </button>
                <button 
                  onClick={() => { setRoute('HUB'); setLastDamageDealt(null); setLastDrops(null); setLastStoryStage(null); }}
                  className="w-full sm:w-1/2 px-6 py-4 bg-[#111111] hover:bg-white/10 text-white/70 hover:text-white font-bold rounded-full font-mono uppercase tracking-widest transition-all border border-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-95 text-xs"
                >
                  В Хаб
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => { setRoute('HUB'); setLastDamageDealt(null); setBossRushResults(null); setLastDrops(null); }}
              className="w-full sm:w-auto min-w-[240px] px-10 py-4 bg-white hover:bg-white/90 text-black font-black rounded-full font-mono uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 mt-6 text-xs"
            >
              Продолжить
            </button>
          )}
        </div>
      )}

      {currentRouteName === 'DEFEAT' && (
        <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-6 w-full max-w-3xl mx-auto p-4 sm:p-6 pb-20">
           
           <div className="text-center flex flex-col items-center gap-3">
             <h2 className="text-5xl md:text-7xl font-black text-white/90 font-mono uppercase tracking-widest">
               Сбой
             </h2>
             <div className="h-0.5 w-12 bg-white/20 mx-auto rounded-full" />
             <p className="text-white/40 font-mono text-[10px] sm:text-xs tracking-widest uppercase mt-2">
               Отряд уничтожен. Протокол восстановления активен.
             </p>
           </div>

            {/* Damage Statistics (Defeat) */}
            {lastDamageDealt && (
              <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 w-full max-w-2xl text-left transition-colors hover:border-white/10">
                <div className="flex justify-between items-end border-b border-white/5 pb-4 mb-5">
                  <h3 className="text-[11px] font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
                    <Swords className="w-4 h-4 text-white/50" /> Анализ неудачи
                  </h3>
                  {lastDamageDealt.__duration && (
                    <div className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-widest flex flex-col items-end">
                      <span>Средний DPS</span>
                      <span className="text-white/70 text-sm mt-0.5">
                        {Math.floor(
                          Object.entries(lastDamageDealt)
                            .filter(([uid]) => (lastBattleParty.length > 0 ? lastBattleParty : playerParty).some(p => p.uid === uid) && uid !== '__duration')
                            .reduce((sum, [, d]) => sum + (d as number), 0) / 
                           (lastDamageDealt.__duration as number || 1)
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {Object.entries(lastDamageDealt)
                    .filter(([uid]) => (lastBattleParty.length > 0 ? lastBattleParty : playerParty).some(p => p.uid === uid) && uid !== '__duration')
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([uid, dmg]) => {
                      const activeParty = lastBattleParty.length > 0 ? lastBattleParty : playerParty;
                      const hero = activeParty.find(p => p.uid === uid);
                      const name = hero?.name || uid;
                      const splash = hero ? getCharSplash(hero.id) : null;
                      const playerStats = Object.entries(lastDamageDealt)
                        .filter(([u]) => activeParty.some(p => p.uid === u) && u !== '__duration')
                        .map(([, d]) => d as number);
                      const maxDmg = Math.max(1, ...playerStats);
                      const percent = Math.max(2, ((dmg as number) / maxDmg) * 100);
                      
                      return (
                        <div key={uid} className="flex flex-col gap-2">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <div className="flex items-center gap-3">
                              {splash ? (
                                <img src={splash} alt={name} className="w-7 h-7 rounded-full object-cover border border-white/10 grayscale opacity-80" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">
                                  {name[0]}
                                </div>
                              )}
                              <span className="text-white/60 font-bold tracking-widest uppercase">{name}</span>
                            </div>
                            <span className="text-white/70 font-black text-sm">{Math.floor(dmg as number).toLocaleString()} DMG</span>
                          </div>
                          <div className="w-full bg-[#0a0a0a] h-1.5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                               initial={{ width: 0 }} 
                               animate={{ width: \`\${percent}%\` }} 
                               transition={{ duration: 1.2, ease: "easeOut" }}
                              className="h-full bg-white/20 rounded-full" 
                             />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

          {lastStoryStage ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mt-4">
              <button 
                onClick={() => { setRoute({ type: 'STORY_STAGE', stage: lastStoryStage }); setLastDamageDealt(null); }}
                className="w-full sm:w-1/2 px-6 py-4 bg-white hover:bg-white/90 text-black font-black rounded-full font-mono uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Повторить</span>
              </button>
              <button 
                onClick={() => { setRoute('STORY'); setLastDamageDealt(null); setLastStoryStage(null); }}
                className="w-full sm:w-1/2 px-6 py-4 bg-[#111111] hover:bg-white/10 text-white/70 hover:text-white font-bold rounded-full font-mono uppercase tracking-widest transition-all border border-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-95 text-xs"
              >
                В сюжет
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setRoute('HUB'); setLastDamageDealt(null); setBossRushResults(null); }}
              className="w-full sm:w-auto min-w-[240px] px-10 py-4 bg-white hover:bg-white/90 text-black font-black rounded-full font-mono uppercase tracking-widest transition-all border border-white/10 hover:scale-[1.02] active:scale-95 mt-4 text-xs"
            >
              В Хаб
            </button>
          )}
        </div>
      )}
`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);

fs.writeFileSync('src/App.tsx', code);
