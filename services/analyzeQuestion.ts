// Lightweight, deterministic preference detector for user questions.
// No extra LLM call — keyword/regex matching keeps retrieval cheap and predictable.
// The detected preferences are surfaced to Claude in buildPrompt so it can weight
// its ranking toward what the user actually cares about.

export interface QuestionPreferences {
  quiet: boolean;
  wifi: boolean;
  outlets: boolean;
  remoteWork: boolean;
  coffeeQuality: boolean;
  atmosphere: boolean;
  neighborhood: string | null;
  // Human-readable phrases for the prompt, e.g. "a quiet environment".
  matched: string[];
}

const SIGNALS: {
  key: Exclude<keyof QuestionPreferences, 'neighborhood' | 'matched'>;
  label: string;
  pattern: RegExp;
}[] = [
  {
    key: 'quiet',
    label: 'a quiet, low-noise environment',
    pattern: /\b(quiet|calm|silent|peaceful|noise|noisy)\b/i,
  },
  {
    key: 'wifi',
    label: 'strong / reliable WiFi',
    pattern: /\b(wi-?fi|internet|connection|connectivity|online)\b/i,
  },
  {
    key: 'outlets',
    label: 'power outlets / charging',
    pattern: /\b(outlet|outlets|plug|plugs|socket|sockets|charge|charging|power)\b/i,
  },
  {
    key: 'remoteWork',
    label: 'a place suited to remote work / studying',
    pattern:
      /\b(remote work|work|working|study|studying|laptop|meeting|meetings|focus|productive|productivity|co-?work)\b/i,
  },
  {
    key: 'coffeeQuality',
    label: 'high coffee quality',
    pattern:
      /\b(coffee quality|good coffee|best coffee|great coffee|specialty|espresso|latte|cappuccino|beans|barista|roast)\b/i,
  },
  {
    key: 'atmosphere',
    label: 'a pleasant atmosphere / vibe',
    pattern:
      /\b(atmosphere|vibe|ambiance|ambience|cozy|cosy|aesthetic|decor|relax|relaxing|chill|romantic|beautiful)\b/i,
  },
];

// Known Marrakech neighborhoods. Longer / multi-word names first so they win.
const NEIGHBORHOODS = [
  'Ville Nouvelle',
  'Sidi Ghanem',
  'Gueliz',
  'Guéliz',
  'Hivernage',
  'Palmeraie',
  'Majorelle',
  'Kasbah',
  'Medina',
  'Médina',
  'Mellah',
  'Agdal',
];

export function analyzeQuestion(question: string): QuestionPreferences {
  const prefs: QuestionPreferences = {
    quiet: false,
    wifi: false,
    outlets: false,
    remoteWork: false,
    coffeeQuality: false,
    atmosphere: false,
    neighborhood: null,
    matched: [],
  };

  for (const signal of SIGNALS) {
    if (signal.pattern.test(question)) {
      prefs[signal.key] = true;
      prefs.matched.push(signal.label);
    }
  }

  for (const name of NEIGHBORHOODS) {
    const pattern = new RegExp(`\\b${name}\\b`, 'i');
    if (pattern.test(question)) {
      prefs.neighborhood = name;
      prefs.matched.push(`located in ${name}`);
      break;
    }
  }

  return prefs;
}
