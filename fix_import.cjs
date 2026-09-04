const fs = require('fs');
let code = fs.readFileSync('src/components/HubMenu.tsx', 'utf8');

code = code.replace(/import Joyride, \{ Step, CallBackProps, STATUS \} from 'react-joyride';/, 
  "import { Joyride, Step, CallBackProps, STATUS } from 'react-joyride';"
);

fs.writeFileSync('src/components/HubMenu.tsx', code);
console.log("Fixed import");
