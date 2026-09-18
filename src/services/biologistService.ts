/**
 * biologistService.ts
 *
 * Fetches the Biology section of a Pokémon's Bulbapedia page using the
 * Mediawiki Action API, parses the HTML with the browser's built-in DOMParser,
 * and returns a masked excerpt for the Biolo-gist minigame.
 *
 * Includes automatic fallback to PokeAPI Pokédex descriptions if Bulbapedia
 * is unreachable or the article is structured differently.
 */

import { POKEAPI_BASE_URL } from './pokeapi';

export interface BiologyExcerpt {
  /** The full masked text with Pokémon name replaced. */
  maskedText: string;
  /** Original plain text (for debugging / victory reveal). */
  originalText: string;
  /** How many times the name was redacted in the excerpt. */
  redactionCount: number;
}

/**
 * Returns the base URL for Bulbapedia's Mediawiki API.
 */
function getBulbapediaApiBase(): string {
  const { hostname } = window.location;
  const isDev =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.local');

  return isDev
    ? '/bulbapedia-api/w/api.php'
    : 'https://bulbapedia.bulbagarden.net/w/api.php';
}

/**
 * Build the canonical Bulbapedia page title for the Mediawiki API.
 */
export function buildPageTitle(pokemonName: string): string {
  const SPECIAL_NAME_MAP: Record<string, string> = {
    'nidoran-m': 'Nidoran♂',
    'nidoran-f': 'Nidoran♀',
    'mr-mime': 'Mr._Mime',
    'mr-rime': 'Mr._Rime',
    'mime-jr': 'Mime_Jr.',
    'type-null': 'Type:_Null',
    'jangmo-o': 'Jangmo-o',
    'hakamo-o': 'Hakamo-o',
    'kommo-o': 'Kommo-o',
    'tapu-koko': 'Tapu_Koko',
    'tapu-lele': 'Tapu_Lele',
    'tapu-bulu': 'Tapu_Bulu',
    'tapu-fini': 'Tapu_Fini',
    'porygon-z': 'Porygon-Z',
    'porygon2': 'Porygon2',
    'ho-oh': 'Ho-Oh',
    'flabebe': 'Flabébé',
    'farfetchd': "Farfetch'd",
    'farfetch-d': "Farfetch'd",
    'sirfetchd': "Sirfetch'd",
    'sirfetch-d': "Sirfetch'd",
    'ting-lu': 'Ting-Lu',
    'chien-pao': 'Chien-Pao',
    'wo-chien': 'Wo-Chien',
    'chi-yu': 'Chi-Yu',
    // Paradox Pokémon
    'great-tusk': 'Great_Tusk',
    'scream-tail': 'Scream_Tail',
    'brute-bonnet': 'Brute_Bonnet',
    'flutter-mane': 'Flutter_Mane',
    'slither-wing': 'Slither_Wing',
    'sandy-shocks': 'Sandy_Shocks',
    'iron-treads': 'Iron_Treads',
    'iron-bundle': 'Iron_Bundle',
    'iron-hands': 'Iron_Hands',
    'iron-jugulis': 'Iron_Jugulis',
    'iron-moth': 'Iron_Moth',
    'iron-thorns': 'Iron_Thorns',
    'roaring-moon': 'Roaring_Moon',
    'iron-valiant': 'Iron_Valiant',
    'walking-wake': 'Walking_Wake',
    'iron-leaves': 'Iron_Leaves',
    'gouging-fire': 'Gouging_Fire',
    'raging-bolt': 'Raging_Bolt',
    'iron-boulder': 'Iron_Boulder',
    'iron-crown': 'Iron_Crown',
  };

  const lower = pokemonName.toLowerCase().trim();
  if (SPECIAL_NAME_MAP[lower]) {
    return `${SPECIAL_NAME_MAP[lower]}_(Pokémon)`;
  }

  // Strip common PokeAPI form suffixes if not a special paradox name
  const stripped = lower
    .replace(/-(alola|galar|hisui|paldea|mega|gmax|incarnate|therian|normal|altered|origin|land|sky|crowned|single-strike|rapid-strike|amped|low-key|solo|school|disguised|busted|ice|noice|full-belly|hangry|male|female|red-meteor|yellow-meteor|green-meteor|blue-meteor|violet-meteor|indigo-meteor|orange-meteor|red-striped|blue-striped|white-striped|dusk|dawn|ultra|midday|midnight|complete|10|50|core|active|pom-pom|pau|sensu|baile|blade|shield|average|small|large|super|ordinary|resolute|aria|pirouette|east|west|plant|sandy|trash)$/i, '');

  if (SPECIAL_NAME_MAP[stripped]) {
    return `${SPECIAL_NAME_MAP[stripped]}_(Pokémon)`;
  }

  // Standard: Capitalize each word and join with underscores
  const formatted = stripped
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('_');

  return `${formatted}_(Pokémon)`;
}

/** Fetch the index of the Biology section via the Mediawiki API. */
async function fetchBiologySectionIndex(pageTitle: string): Promise<number | null> {
  try {
    const params = new URLSearchParams({
      action: 'parse',
      page: pageTitle,
      prop: 'sections',
      format: 'json',
      origin: '*',
    });

    const res = await fetch(`${getBulbapediaApiBase()}?${params}`);
    if (!res.ok) return null;

    const data = await res.json();
    const sections: Array<{ index: string; line: string }> = data?.parse?.sections ?? [];

    const bioSection = sections.find(
      (s) => s.line && (s.line.toLowerCase().trim() === 'biology' || s.line.toLowerCase().includes('biology'))
    );

    return bioSection ? parseInt(bioSection.index, 10) : null;
  } catch {
    return null;
  }
}

/** Fetch the Biology section HTML and extract clean prose text. */
async function fetchBiologySectionText(pageTitle: string, sectionIndex?: number | null): Promise<string> {
  const params = new URLSearchParams({
    action: 'parse',
    page: pageTitle,
    prop: 'text',
    format: 'json',
    origin: '*',
    disablelimitreport: '1',
  });

  if (sectionIndex !== undefined && sectionIndex !== null) {
    params.set('section', String(sectionIndex));
  }

  const res = await fetch(`${getBulbapediaApiBase()}?${params}`);
  if (!res.ok) throw new Error('Failed to fetch biology section');

  const data = await res.json();
  const html: string = data?.parse?.text?.['*'] ?? '';
  if (!html) throw new Error('Empty biology section HTML');

  // Parse with browser DOMParser
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Remove all tables, navigation boxes, images, references, etc.
  doc.querySelectorAll('table, figure, .navbox, .infobox, sup, .reference, .toc, .mw-empty-elt').forEach((el) => el.remove());

  // Collect text from <p> tags only (the prose paragraphs)
  const paragraphs: string[] = [];
  doc.querySelectorAll('p').forEach((p) => {
    const text = (p.textContent ?? '').trim();
    if (text.length > 20) {
      paragraphs.push(text);
    }
  });

  return paragraphs.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Fallback: Fetches flavor text entries from PokeAPI species lore
 * when Bulbapedia cannot be reached or does not have a standard Biology section.
 */
async function fetchPokeApiFlavorFallback(pokemonIdOrName: number | string): Promise<string> {
  try {
    const res = await fetch(`${POKEAPI_BASE_URL}/pokemon-species/${pokemonIdOrName}/`);
    if (!res.ok) return '';

    const data = await res.json();
    const englishEntries: Array<{ flavor_text: string }> = (data.flavor_text_entries ?? [])
      .filter((e: any) => e.language?.name === 'en');

    if (englishEntries.length === 0) return '';

    // Collect distinct entries
    const seen = new Set<string>();
    const descriptions: string[] = [];

    for (const entry of englishEntries) {
      const clean = entry.flavor_text
        .replace(/[\n\f\r]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const normalized = clean.toLowerCase();
      if (!seen.has(normalized) && clean.length > 15) {
        seen.add(normalized);
        descriptions.push(clean);
        if (descriptions.length >= 3) break;
      }
    }

    return descriptions.join(' ');
  } catch {
    return '';
  }
}

/**
 * Snap the excerpt to the nearest sentence boundary near the target word count.
 */
function snapToSentenceBoundary(
  words: string[],
  targetWords: number = 75,
  maxForwardSlack: number = 40
): string {
  if (words.length <= targetWords) return words.join(' ');

  let backwardIdx = -1;
  for (let i = targetWords - 1; i >= 0; i--) {
    if (words[i].endsWith('.') || words[i].endsWith('!') || words[i].endsWith('?')) {
      backwardIdx = i;
      break;
    }
  }

  let forwardIdx = -1;
  for (let i = targetWords; i < Math.min(words.length, targetWords + maxForwardSlack); i++) {
    if (words[i].endsWith('.') || words[i].endsWith('!') || words[i].endsWith('?')) {
      forwardIdx = i;
      break;
    }
  }

  if (forwardIdx !== -1) {
    return words.slice(0, forwardIdx + 1).join(' ');
  }

  if (backwardIdx !== -1) {
    return words.slice(0, backwardIdx + 1).join(' ');
  }

  return words.slice(0, targetWords).join(' ');
}

/**
 * Build a set of name variants to redact from the text.
 */
function buildNameVariants(
  canonicalName: string,
  displayName: string,
  aliases: string[]
): string[] {
  const variants = new Set<string>();

  [canonicalName, displayName, ...aliases].forEach((v) => {
    if (v && typeof v === 'string' && v.length > 1) {
      variants.add(v);
    }
  });

  const withoutHyphen = displayName.replace(/-/g, ' ').trim();
  if (withoutHyphen !== displayName) variants.add(withoutHyphen);

  const withoutApostrophe = displayName.replace(/'/g, '').trim();
  if (withoutApostrophe !== displayName) variants.add(withoutApostrophe);

  return Array.from(variants).sort((a, b) => b.length - a.length);
}

/**
 * Replace all occurrences of Pokémon name variants in text with masked tokens.
 */
export function maskPokemonName(
  text: string,
  canonicalName: string,
  displayName: string,
  aliases: string[]
): { maskedText: string; redactionCount: number } {
  if (!text || typeof text !== 'string') {
    return { maskedText: '', redactionCount: 0 };
  }

  const variants = buildNameVariants(canonicalName, displayName, aliases);
  let result = text;
  let redactionCount = 0;

  for (const variant of variants) {
    const escaped = variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Replace [Name] or [Name]'s / [Name]’s while preserving any possessive apostrophe 's outside the redaction
    result = result.replace(
      new RegExp(`\\b(${escaped})((?:['’]s?)?)(?=\\b|[^a-zA-Z0-9]|$)`, 'gi'),
      (_match, _name, apostrophe) => {
        redactionCount++;
        return `▢▢▢▢▢▢▢▢${apostrophe || ''}`;
      }
    );
  }

  return { maskedText: result, redactionCount };
}

/**
 * Main service entry point.
 * Fetches and processes the Biology excerpt for a given Pokémon.
 */
export async function fetchBiologyExcerpt(
  pokemonName: string,
  displayName: string,
  aliases: string[],
  targetWords: number = 75,
  pokemonId?: number
): Promise<BiologyExcerpt> {
  const pageTitle = buildPageTitle(pokemonName);
  let fullText = '';

  // 1. Try fetching from Bulbapedia via section index or section 1
  try {
    const sectionIndex = await fetchBiologySectionIndex(pageTitle);
    fullText = await fetchBiologySectionText(pageTitle, sectionIndex ?? 1);
  } catch {
    // If section fetch failed, try full page parse
    try {
      fullText = await fetchBiologySectionText(pageTitle);
    } catch {
      fullText = '';
    }
  }

  // 2. If Bulbapedia failed or returned empty text, fallback to PokeAPI species lore
  if (!fullText || fullText.length < 30) {
    const idOrName = pokemonId || pokemonName;
    fullText = await fetchPokeApiFlavorFallback(idOrName);
  }

  // 3. Fallback default if all remote sources are completely unavailable
  if (!fullText || fullText.length < 20) {
    fullText = `${displayName} is a mysterious Pokémon whose biological characteristics are being studied by Pokémon professors across multiple regions.`;
  }

  // 4. Snap to sentence boundary
  const words = fullText.split(/\s+/).filter(Boolean);
  const excerpt = snapToSentenceBoundary(words, targetWords);

  // 5. Mask the Pokémon name
  const { maskedText, redactionCount } = maskPokemonName(
    excerpt,
    pokemonName,
    displayName,
    aliases
  );

  return {
    maskedText: maskedText || excerpt,
    originalText: excerpt,
    redactionCount: Math.max(1, redactionCount),
  };
}
