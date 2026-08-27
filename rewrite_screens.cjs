const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const startMarker = `      {currentRouteName === 'VICTORY' && (`
const endMarker = `    </div>\n  );\n}`

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Markers not found");
  process.exit(1);
}

console.log("Markers found!");
