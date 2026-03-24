// fetchVerses.js
const https = require('https');
const fs = require('fs');
const path = require('path');

const CHAPTERS = [
  { number: 1, verses: 47 }, { number: 2, verses: 72 }, { number: 3, verses: 43 },
  { number: 4, verses: 42 }, { number: 5, verses: 29 }, { number: 6, verses: 47 },
  { number: 7, verses: 30 }, { number: 8, verses: 28 }, { number: 9, verses: 34 },
  { number: 10, verses: 42 }, { number: 11, verses: 55 }, { number: 12, verses: 20 },
  { number: 13, verses: 35 }, { number: 14, verses: 27 }, { number: 15, verses: 20 },
  { number: 16, verses: 24 }, { number: 17, verses: 28 }, { number: 18, verses: 78 }
];

// Naya aur 100% safe Static API URL
const fetchVerse = (chapter, verse) => {
  return new Promise((resolve) => {
    const url = `https://vedicscriptures.github.io/slok/${chapter}/${verse}/`;
    
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
};

async function downloadGita() {
  console.log("🕉️ Starting Super-Fast Bhagavad Gita Download...");
  
  const dirPath = path.join(__dirname, 'src', 'data');
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  
  const dbPath = path.join(dirPath, 'gitaDatabase.json');
  let db = {};

  for (let ch of CHAPTERS) {
    db[ch.number] = {};
    process.stdout.write(`📚 Downloading Chapter ${ch.number} (${ch.verses} Verses): `);
    
    // Ab hum ek chapter ke saare shlok ek sath (parallel) mangwayenge taaki fast ho!
    const promises = [];
    for (let v = 1; v <= ch.verses; v++) {
      promises.push(fetchVerse(ch.number, v).then(data => ({ v, data })));
    }

    const results = await Promise.all(promises);

    for (let result of results) {
      let { v, data } = result;
      if (data) {
         let english = data.purohit?.et || data.siva?.et || data.adi?.et || '';
         let hindi = data.tej?.ht || data.rams?.ht || data.chinmay?.hc || '';
         
         db[ch.number][v] = {
           sanskrit: data.slok || '',
           transliteration: data.transliteration || '',
           hindi: hindi.trim(),
           english: english.trim()
         };
         process.stdout.write('.'); // Success
      } else {
         db[ch.number][v] = { sanskrit: "Verse Data Missing", transliteration: "", hindi: "", english: "" };
         process.stdout.write('X'); // Failed
      }
    }
    
    // Save chapter by chapter
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log(" Done!");
  }
  
  console.log("\n🌺 100% Download Complete! Ab app reload karo.");
}

downloadGita();