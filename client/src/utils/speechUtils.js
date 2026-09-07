/**
 * Speech Processing & Voice Selection Utilities for Kisan Sahayak
 * - cleanTextForDisplay: Sanitizes Markdown for clean UI presentation (no raw ** or #)
 * - prepareTextForSpeech: Prepares natural spoken sentences (natural step conversion, symbols)
 * - getBestFemaleVoice: Dynamically chooses the most natural, soft female support voice
 */

const STEP_ORDINALS_HI = [
  'पहला कदम। ',
  'दूसरा कदम। ',
  'तीसरा कदम। ',
  'चौथा कदम। ',
  'पाँचवाँ कदम। ',
  'छठा कदम। ',
  'सातवाँ कदम। ',
  'आठवाँ कदम। ',
  'नौवाँ कदम। ',
  'दसवाँ कदम। '
];

const STEP_ORDINALS_HINGLISH = [
  'Pehla step. ',
  'Doosra step. ',
  'Teesra step. ',
  'Chautha step. ',
  'Paanchva step. ',
  'Chhatha step. ',
  'Saatva step. ',
  'Aathva step. ',
  'Nauva step. ',
  'Dasva step. '
];

const STEP_ORDINALS_EN = [
  'First. ',
  'Second. ',
  'Third. ',
  'Fourth. ',
  'Fifth. ',
  'Sixth. ',
  'Seventh. ',
  'Eighth. ',
  'Ninth. ',
  'Tenth. '
];

/**
 * Sanitizes Markdown formatting for visual display in the chat UI
 * Removes **, *, ###, _, ` while preserving complete words and line breaks.
 */
export function cleanTextForDisplay(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  let clean = rawText;

  // 1. Remove markdown bold/italic markers while preserving words
  clean = clean.replace(/\*\*\*([^*]+)\*\*\*/g, '$1');
  clean = clean.replace(/\*\*([^*]+)\*\*/g, '$1');
  clean = clean.replace(/\*([^*]+)\*/g, '$1');
  clean = clean.replace(/___([^_]+)___/g, '$1');
  clean = clean.replace(/__([^_]+)__/g, '$1');
  clean = clean.replace(/_([^_]+)_/g, '$1');

  // 2. Remove heading hashes at start of line
  clean = clean.replace(/^#{1,6}\s*/gm, '');

  // 3. Remove inline code backticks
  clean = clean.replace(/`([^`]+)`/g, '$1');

  // 4. Convert markdown links [Text](url) -> Text
  clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  return clean.trim();
}

/**
 * Prepares raw AI response for human-like Text-to-Speech
 * Converts Markdown and numbered lists into natural conversational sentences.
 */
export function prepareTextForSpeech(rawText, language = 'hinglish') {
  if (!rawText || typeof rawText !== 'string') return [];

  let text = rawText;

  // 1. Remove Markdown links [Label](url) -> Label
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 2. Remove raw URLs
  text = text.replace(/https?:\/\/\S+/g, '');

  // 3. Remove Markdown headings (### Heading -> Heading.)
  text = text.replace(/^#{1,6}\s*(.+)$/gm, '$1.');

  // 4. Remove bold & italic formatting
  text = text.replace(/\*\*\*([^*]+)\*\*\*/g, '$1');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/___([^_]+)___/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');

  // 5. Remove inline code `code` -> code
  text = text.replace(/`([^`]+)`/g, '$1');

  // 6. Replace symbols with natural spoken equivalents
  text = text.replace(/₹\s*/g, language === 'en' ? ' Rupees ' : ' रुपये ');
  text = text.replace(/\s*\/\s*/g, language === 'en' ? ' or ' : ' या ');
  text = text.replace(/\s*&\s*/g, language === 'en' ? ' and ' : ' और ');
  text = text.replace(/%/g, language === 'en' ? ' percent' : ' प्रतिशत');
  text = text.replace(/±/g, language === 'en' ? ' plus or minus ' : ' लगभग ');
  text = text.replace(/~/g, language === 'en' ? ' approximately ' : ' लगभग ');

  // 7. Remove emojis and decorative symbols
  text = text.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ' ');

  // 8. Process line by line to convert numbered lists & bullets naturally
  const lines = text.split('\n');
  const processedSentences = [];
  let stepCounter = 0;

  for (let line of lines) {
    let cleanLine = line.trim();
    if (!cleanLine) continue;

    // Check if line is a numbered list item: "1. Sentence..." or "1) Sentence..."
    const numberedMatch = cleanLine.match(/^(\d+)[\.\)]\s*(.+)$/);
    if (numberedMatch) {
      const content = numberedMatch[2].trim();
      let stepPrefix = '';
      if (language === 'hi') {
        stepPrefix = STEP_ORDINALS_HI[stepCounter] || `कदम ${stepCounter + 1}। `;
      } else if (language === 'en') {
        stepPrefix = STEP_ORDINALS_EN[stepCounter] || `Step ${stepCounter + 1}. `;
      } else {
        stepPrefix = STEP_ORDINALS_HINGLISH[stepCounter] || `Step ${stepCounter + 1}. `;
      }
      stepCounter++;
      cleanLine = `${stepPrefix}${content}`;
    } else {
      // Check if bullet point "- ..." or "* ..."
      const bulletMatch = cleanLine.match(/^[-*•]\s*(.+)$/);
      if (bulletMatch) {
        cleanLine = bulletMatch[1].trim();
      }
    }

    // Clean remaining unwanted characters
    cleanLine = cleanLine.replace(/[*#_~`\[\]]/g, '').trim();

    // Clean awkward double punctuation like ":." -> "."
    cleanLine = cleanLine.replace(/:\s*[\.\।]/g, '.');

    // Ensure line ends with punctuation for natural cadence
    if (cleanLine && !/[.!?।:]$/.test(cleanLine)) {
      cleanLine += '.';
    }

    // Split long lines at sentence boundaries if necessary (safe chunking)
    if (cleanLine.length > 160) {
      const subSentences = cleanLine.split(/(?<=[.?!।])\s+/);
      for (const sub of subSentences) {
        const trimmed = sub.trim();
        if (trimmed && trimmed.length > 1) {
          processedSentences.push(trimmed);
        }
      }
    } else if (cleanLine.length > 1) {
      processedSentences.push(cleanLine);
    }
  }

  // Fallback: If no lines found, return raw cleaned text
  if (processedSentences.length === 0 && rawText.trim()) {
    const singleClean = rawText.replace(/[*#_~`\[\]]/g, '').trim();
    if (singleClean) processedSentences.push(singleClean);
  }

  return processedSentences;
}

/**
 * Dynamically selects the best available soft, friendly FEMALE voice
 * from window.speechSynthesis.getVoices()
 */
export function getBestFemaleVoice(voices, language = 'hinglish') {
  if (!voices || voices.length === 0) return null;

  const lang = (language || 'hinglish').toLowerCase();

  // Helper score for a voice
  function scoreVoice(voice) {
    let score = 0;
    const name = voice.name.toLowerCase();
    const vLang = voice.lang.toLowerCase();

    // 1. Language matching
    if (lang === 'hi' || lang === 'hindi') {
      if (vLang.startsWith('hi')) score += 100;
      else if (vLang.startsWith('en-in') || vLang.includes('india')) score += 50;
    } else if (lang === 'en' || lang === 'english') {
      if (vLang.startsWith('en-in') || vLang.includes('india')) score += 100;
      else if (vLang.startsWith('en-gb') || vLang.startsWith('en-us') || vLang.startsWith('en')) score += 60;
    } else if (lang === 'pa' || lang === 'punjabi') {
      if (vLang.startsWith('pa')) score += 120;
      else if (vLang.startsWith('hi')) score += 60;
    } else if (lang === 'ta' || lang === 'tamil') {
      if (vLang.startsWith('ta')) score += 120;
      else if (vLang.startsWith('en-in')) score += 50;
    } else if (lang === 'te' || lang === 'telugu') {
      if (vLang.startsWith('te')) score += 120;
      else if (vLang.startsWith('en-in')) score += 50;
    } else if (lang === 'mr' || lang === 'marathi') {
      if (vLang.startsWith('mr')) score += 120;
      else if (vLang.startsWith('hi')) score += 70;
    } else if (lang === 'bn' || lang === 'bengali') {
      if (vLang.startsWith('bn')) score += 120;
      else if (vLang.startsWith('hi')) score += 50;
    } else if (lang === 'gu' || lang === 'gujarati') {
      if (vLang.startsWith('gu')) score += 120;
      else if (vLang.startsWith('hi')) score += 70;
    } else if (lang === 'kn' || lang === 'kannada') {
      if (vLang.startsWith('kn')) score += 120;
      else if (vLang.startsWith('en-in')) score += 50;
    } else if (lang === 'ml' || lang === 'malayalam') {
      if (vLang.startsWith('ml')) score += 120;
      else if (vLang.startsWith('en-in')) score += 50;
    } else if (lang === 'or' || lang === 'odia') {
      if (vLang.startsWith('or')) score += 120;
      else if (vLang.startsWith('hi')) score += 50;
    } else if (lang === 'as' || lang === 'assamese') {
      if (vLang.startsWith('as')) score += 120;
      else if (vLang.startsWith('hi')) score += 50;
    } else {
      // Hinglish -> Prefer Indian Hindi female or Indian English female
      if (vLang.startsWith('hi')) score += 95;
      else if (vLang.startsWith('en-in') || vLang.includes('india')) score += 85;
      else if (vLang.startsWith('en')) score += 40;
    }

    // 2. High priority bonus for known friendly Indian female voices
    const femaleKeywords = [
      'female', 'swara', 'lekha', 'veena', 'aditi', 'kavya', 'heera', 'kalpana',
      'priya', 'ananya', 'neerja', 'shruti', 'pooja', 'sunita', 'sangeeta',
      'google हिन्दी', 'google hi', 'google hindi', 'google english india',
      'samantha', 'karen', 'victoria', 'zira', 'serena', 'moira', 'fiona', 'kyoko'
    ];

    for (const kw of femaleKeywords) {
      if (name.includes(kw)) {
        score += 80;
        break;
      }
    }

    // 3. Penalty for explicit male voices
    const maleKeywords = ['male', 'rishi', 'hemant', 'david', 'george', 'mark', 'ravi', 'prabhat', 'madhur'];
    for (const kw of maleKeywords) {
      if (name.includes(kw) && !name.includes('female')) {
        score -= 50;
        break;
      }
    }

    // 4. Prefer high-quality local/native voices
    if (voice.localService) score += 10;
    if (name.includes('natural') || name.includes('online') || name.includes('enhanced')) score += 15;

    return score;
  }

  // Sort voices by score descending
  const sorted = [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a));

  return sorted[0] || voices[0];
}
