// fetchVerses.js - Run: node fetchVerses.js
const https = require('https');
const fs = require('fs');

const CHAPTERS = [
  { number: 1, name: 'Arjuna Vishada Yoga', nameHindi: 'अर्जुन विषाद योग', verses: 47, theme: "Arjuna's Dilemma" },
  { number: 2, name: 'Sankhya Yoga', nameHindi: 'सांख्य योग', verses: 72, theme: 'Yoga of Knowledge' },
  { number: 3, name: 'Karma Yoga', nameHindi: 'कर्म योग', verses: 43, theme: 'Yoga of Action' },
  { number: 4, name: 'Jnana Karma Sanyasa Yoga', nameHindi: 'ज्ञान कर्म संन्यास योग', verses: 42, theme: 'Renunciation through Knowledge' },
  { number: 5, name: 'Karma Sanyasa Yoga', nameHindi: 'कर्म संन्यास योग', verses: 29, theme: 'Yoga of Renunciation' },
  { number: 6, name: 'Dhyana Yoga', nameHindi: 'ध्यान योग', verses: 47, theme: 'Yoga of Meditation' },
  { number: 7, name: 'Jnana Vijnana Yoga', nameHindi: 'ज्ञान विज्ञान योग', verses: 30, theme: 'Knowledge and Wisdom' },
  { number: 8, name: 'Aksara Brahma Yoga', nameHindi: 'अक्षर ब्रह्म योग', verses: 28, theme: 'Imperishable Brahman' },
  { number: 9, name: 'Raja Vidya Yoga', nameHindi: 'राज विद्या योग', verses: 34, theme: 'Confidential Knowledge' },
  { number: 10, name: 'Vibhuti Yoga', nameHindi: 'विभूति योग', verses: 42, theme: 'Opulence of the Absolute' },
  { number: 11, name: 'Vishwarupa Darshana Yoga', nameHindi: 'विश्वरूप दर्शन योग', verses: 55, theme: 'Universal Form' },
  { number: 12, name: 'Bhakti Yoga', nameHindi: 'भक्ति योग', verses: 20, theme: 'Yoga of Devotion' },
  { number: 13, name: 'Kshetra Vibhaga Yoga', nameHindi: 'क्षेत्र विभाग योग', verses: 35, theme: 'Nature and Enjoyer' },
  { number: 14, name: 'Gunatraya Vibhaga Yoga', nameHindi: 'गुणत्रय विभाग योग', verses: 27, theme: 'Three Modes of Nature' },
  { number: 15, name: 'Purushottama Yoga', nameHindi: 'पुरुषोत्तम योग', verses: 20, theme: 'Supreme Person' },
  { number: 16, name: 'Daivasura Vibhaga Yoga', nameHindi: 'दैवासुर विभाग योग', verses: 24, theme: 'Divine and Demonic' },
  { number: 17, name: 'Shraddhatraya Yoga', nameHindi: 'श्रद्धात्रय योग', verses: 28, theme: 'Three Divisions of Faith' },
  { number: 18, name: 'Moksha Sanyasa Yoga', nameHindi: 'मोक्ष संन्यास योग', verses: 78, theme: 'Yoga of Liberation' },
];

// Follow redirects
function fetchURL(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchURL(res.headers.location, maxRedirects - 1).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error: ' + data.substring(0, 100))); }
      });
    }).on('error', reject);
  });
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function clean(text) {
  if (!text) return '';
  return text
    .replace(/\|\|[\d\-\.]+\|\|/g, '')
    .replace(/।।[\d\.]+।।/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  console.log('🕉️  Fetching 700 Gita verses with English translations...\n');

  const result = { chapters: CHAPTERS, verses: {}, totalVerses: 0 };
  let total = 0;

  for (const ch of CHAPTERS) {
    result.verses[ch.number] = [];
    process.stdout.write(`📖 Chapter ${ch.number}: ${ch.name} `);

    for (let v = 1; v <= ch.verses; v++) {
      try {
        const data = await fetchURL(`https://vedicscriptures.github.io/slok/${ch.number}/${v}`);

        let english = '';
        if (data.purohit && data.purohit.et) english = data.purohit.et;
        else if (data.spitn && data.spitn.et) english = data.spitn.et;
        else if (data.rpitn && data.rpitn.et) english = data.rpitn.et;
        else if (data.abpitn && data.abpitn.et) english = data.abpitn.et;
        else if (data.adi && data.adi.et) english = data.adi.et;
        else if (data.gambir && data.gambir.et) english = data.gambir.et;

        let hindi = '';
        if (data.tej && data.tej.ht) hindi = data.tej.ht;
        else if (data.spitn && data.spitn.ht) hindi = data.spitn.ht;

        result.verses[ch.number].push({
          id: ch.number + '_' + v,
          chapter: ch.number,
          verse: v,
          sanskrit: data.slok || '',
          transliteration: clean(data.transliteration || ''),
          hindi: clean(hindi),
          english: english.trim(),
        });
        total++;
      } catch (e) {
        result.verses[ch.number].push({
          id: ch.number + '_' + v, chapter: ch.number, verse: v,
          sanskrit: '', transliteration: '', hindi: '', english: '',
        });
      }
      await delay(120);
      if (v % 10 === 0) process.stdout.write('.');
    }
    console.log(` ✅ ${result.verses[ch.number].length} verses`);
  }

  result.totalVerses = total;
  fs.writeFileSync('./src/data/gitaDatabase.json', JSON.stringify(result, null, 2));
  console.log(`\n🎉 Done! ${total} verses saved to src/data/gitaDatabase.json`);
}

main().catch(console.error);