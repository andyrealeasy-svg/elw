const fs = require('fs');
let code = fs.readFileSync('src/components/EventsMenu.tsx', 'utf8');

// Replace the Aveline section logic
code = code.replace(
  "const avelineStoryStages = [",
  "const [activeDialogue, setActiveDialogue] = useState<typeof avelineStoryStages[0] | null>(null);\n  const [dialogueIndex, setDialogueIndex] = useState(0);\n  const avelineStoryStages = ["
);

// We need to handle "Начать" button for dialogue
code = code.replace(
  "onClick={() => setRoute({ type: 'STORY_STAGE', stage })}",
  "onClick={() => { if(stage.type === 'DIALOGUE') { setActiveDialogue(stage); setDialogueIndex(0); } else { setRoute({ type: 'STORY_STAGE', stage }); } }}"
);

// Add the dialogue viewer UI at the top of AVELINE tab
const dialogueUI = `
            {activeDialogue && (
              <div className="absolute inset-0 z-50 bg-black/90 p-4 sm:p-8 flex flex-col justify-end animate-in fade-in">
                <div className="flex-1 flex items-center justify-center">
                   {activeDialogue.dialogue?.[dialogueIndex]?.charId && (
                     <img 
                       src={getCharSplash(activeDialogue.dialogue[dialogueIndex].charId!)} 
                       className="h-full max-h-[60vh] object-contain opacity-50"
                     />
                   )}
                </div>
                <div className="bg-[#111] border border-rose-500/30 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto w-full relative shadow-[0_0_50px_rgba(225,29,72,0.1)]">
                   <h4 className="text-xl font-black text-rose-400 uppercase tracking-widest mb-4">
                     {activeDialogue.dialogue?.[dialogueIndex]?.speaker || "..."}
                   </h4>
                   <p className="text-lg text-white/90 leading-relaxed font-serif">
                     {activeDialogue.dialogue?.[dialogueIndex]?.text}
                   </p>
                   <div className="mt-8 flex justify-end">
                     <button 
                       onClick={() => {
                         if (dialogueIndex < (activeDialogue.dialogue?.length || 0) - 1) {
                           setDialogueIndex(prev => prev + 1);
                         } else {
                           updateProfile(p => ({
                             ...p,
                             gems: p.gems + activeDialogue.reward.gems,
                             gold: p.gold + activeDialogue.reward.gold,
                             storyProgress: {
                               ...p.storyProgress,
                               completedStages: [...(p.storyProgress?.completedStages || []), activeDialogue.id]
                             }
                           }));
                           setActiveDialogue(null);
                         }
                       }}
                       className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase rounded-xl tracking-widest transition flex items-center gap-2"
                     >
                       Далее <Play className="w-4 h-4" />
                     </button>
                   </div>
                </div>
              </div>
            )}
`;

code = code.replace(
  "{/* AVELINE STORY */}\n        {subTab === 'AVELINE' && (\n          <div className=\"space-y-6 max-w-4xl mx-auto\">",
  `{/* AVELINE STORY */}\n        {subTab === 'AVELINE' && (\n          <div className="space-y-6 max-w-4xl mx-auto relative h-full">` + dialogueUI
);

fs.writeFileSync('src/components/EventsMenu.tsx', code);
