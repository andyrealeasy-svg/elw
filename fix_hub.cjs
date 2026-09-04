const fs = require('fs');
let code = fs.readFileSync('src/components/HubMenu.tsx', 'utf8');

// fix imports
code = code.replace(/import \{ Joyride, Step, CallBackProps, STATUS \} from 'react-joyride';/,
  "import { Joyride, Step, EventData, STATUS } from 'react-joyride';"
);

// fix callback param
code = code.replace(/const handleJoyrideCallback = \(data: CallBackProps\) => \{/,
  "const handleJoyrideCallback = (data: EventData) => {"
);

// fix Joyride props
code = code.replace(/styles=\{\{\s*options: \{[\s\S]*?\},/g, "options={{\n            primaryColor: '#6366f1',\n            backgroundColor: '#1a1a1a',\n            textColor: '#ffffff',\n            arrowColor: '#ffffff',\n            overlayColor: 'rgba(0, 0, 0, 0.8)',\n          }}\n          styles={{");
code = code.replace(/buttonNext:/g, "buttonPrimary:");
code = code.replace(/callback=\{handleJoyrideCallback\}/, "onEvent={handleJoyrideCallback}");
code = code.replace(/disableBeacon:/g, "skipBeacon:");

fs.writeFileSync('src/components/HubMenu.tsx', code);
console.log("Fixed HubMenu");
