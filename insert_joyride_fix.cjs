const fs = require('fs');
let code = fs.readFileSync('src/components/HubMenu.tsx', 'utf8');

// Remove the one I just added
code = code.replace(/<Joyride[\s\S]*?callback=\{handleJoyrideCallback\}\n\s*\/>\n/g, "");

const joyrideComponent = `
      <Joyride
        steps={tutorialSteps}
        run={showTutorial && activeTab === 'OVERVIEW'}
        continuous
        showSkipButton
        showProgress
        locale={{ last: 'Завершить', next: 'Далее', back: 'Назад', skip: 'Пропустить' }}
        styles={{
          options: {
            primaryColor: '#6366f1',
            backgroundColor: '#1a1a1a',
            textColor: '#ffffff',
            arrowColor: '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.8)',
          },
          tooltip: {
             borderRadius: '16px',
             border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          buttonNext: {
             borderRadius: '8px',
             fontWeight: 'bold',
          },
          buttonBack: {
             color: 'rgba(255, 255, 255, 0.5)',
          },
          buttonSkip: {
             color: 'rgba(255, 255, 255, 0.5)',
          }
        }}
        callback={handleJoyrideCallback}
      />
`;

code = code.replace(/(<div className="w-full max-w-5xl h-\[100dvh\].*?>)/, '$1' + joyrideComponent);

fs.writeFileSync('src/components/HubMenu.tsx', code);
console.log("Fixed Joyride position");
