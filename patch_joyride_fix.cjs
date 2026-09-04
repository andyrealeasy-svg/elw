const fs = require('fs');
let code = fs.readFileSync('src/components/HubMenu.tsx', 'utf8');

if (!code.includes('react-joyride')) {
    code = code.replace(/import React, \{ useState \} from 'react';/, "import React, { useState, useEffect } from 'react';\nimport Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';");
    
    const joyrideSteps = `
  const tutorialSteps: Step[] = [
    {
      target: '.tutorial-story',
      content: 'Здесь начинается ваш путь! Проходите сюжетные миссии, чтобы получать награды и открывать новый контент.',
      disableBeacon: true,
      placement: 'right'
    },
    {
      target: '.tutorial-roster',
      content: 'Управляйте своими персонажами, прокачивайте их уровень и экипируйте артефакты.',
      placement: 'right'
    },
    {
      target: '.tutorial-gacha',
      content: 'Испытайте удачу! Призывайте новых героев и расширяйте свой отряд.',
      placement: 'right'
    },
    {
      target: '.tutorial-events',
      content: 'Участвуйте во временных событиях и забирайте ежедневные бонусы!',
      placement: 'right'
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      updateProfile(p => ({ ...p, tutorialCompleted: true }));
    }
  };
`;

    // Insert inside the component, near the top
    code = code.replace(/export default function HubMenu[\s\S]*?\{/, (match) => match + joyrideSteps);
    
    // Insert the component into the return JSX
    const joyrideComponent = `
      <Joyride
        steps={tutorialSteps}
        run={!profile.tutorialCompleted && activeTab === 'OVERVIEW'}
        continuous
        showSkipButton
        showProgress
        locale={{ last: 'Завершить', next: 'Далее', back: 'Назад', skip: 'Пропустить' }}
        styles={{
          options: {
            primaryColor: '#6366f1',
            backgroundColor: '#1a1a1a',
            textColor: '#ffffff',
            arrowColor: '#1a1a1a',
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
    // Insert right after the top-level <div className="flex h-screen bg-black overflow-hidden relative text-white">
    code = code.replace(/<div className="flex h-screen bg-black overflow-hidden relative text-white">/, (match) => match + joyrideComponent);

    fs.writeFileSync('src/components/HubMenu.tsx', code);
    console.log("Patched HubMenu with Joyride");
}
