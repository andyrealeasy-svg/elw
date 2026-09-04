const fs = require('fs');
let code = fs.readFileSync('src/components/HubMenu.tsx', 'utf8');

// The file has a duplicate signature fragment
code = code.replace(/       profile, setRoute, updateProfile, onLogout, username \}: Props\) \{/, "");

fs.writeFileSync('src/components/HubMenu.tsx', code);
console.log("Cleaned");
