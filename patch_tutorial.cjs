const fs = require('fs');
let code = fs.readFileSync('src/components/HubMenu.tsx', 'utf8');

// We add showTutorial state and effect
const stateToAdd = `
  const [showTutorial, setShowTutorial] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('tutorial_completed_v1')) {
      setShowTutorial(true);
    }
  }, []);
`;

code = code.replace(/export default function HubMenu[\s\S]*?\{/, (match) => match + stateToAdd);

// In handleJoyrideCallback, set local storage and state
const newCallback = `  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem('tutorial_completed_v1', 'true');
      setShowTutorial(false);
      updateProfile(p => ({ ...p, tutorialCompleted: true }));
    }
  };`;

code = code.replace(/const handleJoyrideCallback = \(data: CallBackProps\) => \{[\s\S]*?^\s*\};/m, newCallback);

// In Joyride run condition, use showTutorial && activeTab === 'OVERVIEW'
code = code.replace(/run=\{!profile\.tutorialCompleted && activeTab === 'OVERVIEW'\}/, "run={showTutorial && activeTab === 'OVERVIEW'}");

fs.writeFileSync('src/components/HubMenu.tsx', code);
console.log("Patched tutorial logic");
