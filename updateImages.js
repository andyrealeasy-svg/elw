import fs from 'fs';

let code = fs.readFileSync('src/lib/images.ts', 'utf-8');

const replacements = {
  selina: "'https://i.postimg.cc/85zhZ5hz/file-00000000e7b082108246016470da79e3.png'",
  kopro: "'https://i.postimg.cc/66SdhBTq/file-00000000c230820ab9433cdece0e40d0.png'",
  claymore: "'https://i.postimg.cc/MGdBfShj/file-00000000f078820a8a215da103ca2228.png'",
  patch: "'https://i.postimg.cc/RhnJYnqF/file-000000004c5c820a9ce7b9e16490d9ec.png'",
  spark: "'https://i.postimg.cc/2jqHYcZQ/file-0000000093f0820aae520f180eb7bcd3.png'",
  moyan: "'https://i.postimg.cc/RZvQWXNP/file-00000000cc40820ab2752447e8d5b1e7.png'",
  gotka: "'https://i.postimg.cc/hG593nMr/file-00000000c978820a82a020dc8f58f684.png'",
  nova: "'https://i.postimg.cc/fLSYGPrW/file-000000009c9c820aa7cf88d40f9fef97.png'",
  tide: "'https://i.postimg.cc/RhcKFHmg/file-00000000ade0820aa6e06f9fb24ea26d.png'",
  ineffa: "'https://i.postimg.cc/yYH0Gvhr/file-00000000245c820ab3e956a834cc33bd.png'",
  asher: "'https://i.postimg.cc/529L4yRs/file-00000000459c820a96c88a834ba0e4d7.png'",
  volta: "'https://i.postimg.cc/ZqCNNgZN/file-000000008cb0820aa05f0964eb3f4102.png'",
  aegis: "'https://i.postimg.cc/BvkKBgnS/file-00000000ce5c820ab08bf78e6af0b127.png'",
  cyrus: "'https://i.postimg.cc/x8yNYVyD/file-0000000033d4820a8721773ff32f3058.png'",
  raven: "'https://i.postimg.cc/WbTJ8tTd/file-00000000eb44820aba3549fcac58ca05.png'",
  volosatinya: "'https://i.postimg.cc/nh7bLV9Y/file-00000000ead8820a9dc5296a6e7481cc.png'"
};

for (const [key, url] of Object.entries(replacements)) {
  const regex = new RegExp("\\\\b" + key + ",?\\\\r?\\\\n");
  code = code.replace(regex, key + ": " + url + ",\\n");
}

fs.writeFileSync('src/lib/images.ts', code);
