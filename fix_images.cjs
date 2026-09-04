const fs = require('fs');
let code = fs.readFileSync('src/lib/images.ts', 'utf8');

const replacements = {
  kamikaze: "'https://i.postimg.cc/SshwFZym/file-000000000e6482109f89ca139b92522a.png'",
  aelita: "'https://i.postimg.cc/Ghgw8Jj3/file-0000000044208210992d02a212ccf941.png'",
  echo: "'https://i.postimg.cc/fLN6nHwb/file-00000000c7dc81f49b04297de1549eda.png'",
  selva: "'https://i.postimg.cc/XNxtmct4/file-0000000004cc81f4b710a549b3d9529c.png'",
  neuron: "'https://i.postimg.cc/2jTgMFMK/file-00000000221c81f59022d2b9afa1832d.png'",
  krona: "'https://i.postimg.cc/SRZ59kC3/file-00000000f96881f4b3c6ca22f89acbe7.png'",
  pulse: "'https://i.postimg.cc/sxfq1vQh/file-00000000ca9081f4b6503320f8b812d2.png'",
  maestro: "'https://i.postimg.cc/gJWfFMG1/file-000000009ea882438020bc6ab5929cf6.png'",
  snezhana: "'https://i.postimg.cc/V683Q7Y6/file-00000000529c81f4b71218f74ce069ff.png'"
};

for (const [key, value] of Object.entries(replacements)) {
  const regex = new RegExp(`\\b${key},`, 'g');
  code = code.replace(regex, `${key}: ${value},`);
}

fs.writeFileSync('src/lib/images.ts', code);
