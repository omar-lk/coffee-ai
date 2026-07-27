import { QuestionPreferences } from './analyzeQuestion';

// A retrieved candidate. The `match_coffee_shops` RPC returns structured shop
// columns (name, neighborhood, address, scores, notes, similarity) — NOT the
// embedded chunk text — so `content` is optional and must not be assumed present.
// Every field is optional/nullable to match the untyped RPC payload defensively.
export interface RetrievedShop {
  content?: string;
  name?: string;
  neighborhood?: string | null;
  address?: string | null;
  wifi_score?: number | null;
  noise_score?: number | null;
  outlet_score?: number | null;
  notes?: string | null;
  similarity?: number;
}

// Build a candidate description from the structured fields when no pre-embedded
// `content` string is available.
function describeShop(shop: RetrievedShop): string {
  const lines: string[] = [];

  if (shop.neighborhood) lines.push(`Neighborhood: ${shop.neighborhood}`);
  if (shop.address) lines.push(`Address: ${shop.address}`);

  const score = (label: string, value: number | null | undefined) =>
    typeof value === 'number' ? `${label}: ${value}/5` : null;

  const scores = [
    score('WiFi', shop.wifi_score),
    score('Noise', shop.noise_score),
    score('Outlets', shop.outlet_score),
  ].filter((s): s is string => s !== null);

  if (scores.length > 0) lines.push(scores.join(', '));
  if (shop.notes) lines.push(`Notes: ${shop.notes}`);

  return lines.length > 0 ? lines.join('\n') : 'No additional details available.';
}

function formatCandidate(shop: RetrievedShop, index: number): string {
  const heading = shop.name ? shop.name : `Candidate ${index + 1}`;
  const relevance =
    typeof shop.similarity === 'number'
      ? ` (relevance: ${shop.similarity.toFixed(2)})`
      : '';

  // Prefer the pre-embedded description if the RPC ever returns it; otherwise
  // build the candidate text from the structured fields.
  const body =
    typeof shop.content === 'string' && shop.content.trim().length > 0
      ? shop.content.trim()
      : describeShop(shop);

  return `### ${index + 1}. ${heading}${relevance}
${body}`;
}

export function buildPrompt(
  question: string,
  documents: RetrievedShop[],
  preferences: QuestionPreferences
) {
  const candidates = documents
    .map((doc, index) => formatCandidate(doc, index))
    .join('\n\n-----------------\n\n');

  const detectedPreferences =
    preferences.matched.length > 0
      ? preferences.matched.map((p) => `- ${p}`).join('\n')
      : '- None explicitly stated — infer intent from the question.';

  return `You are an AI assistant that helps users find coffee shops in Marrakech.

You are given a shortlist of candidate coffee shops retrieved for the user's
question. Every candidate below is a real option you may recommend.

## Detected user preferences
${detectedPreferences}

## How to answer
- Consider ALL of the candidates below — do not fixate on a single one.
- Compare them against the user's question and the detected preferences.
- Rank the relevant candidates from best to worst fit.
- For each recommendation, explain WHY it was selected, citing the specific
  attributes (e.g. WiFi score, noise level, outlets, neighborhood, notes) that
  match what the user asked for.
- If a candidate is a weak fit, you may mention it briefly and say why it ranks lower.
- Base every claim only on the candidate information provided — never invent details.
- Only respond that you don't know if NONE of the candidates are relevant to the
  question. As long as at least one candidate is a reasonable fit, recommend it.

## Candidate coffee shops
${candidates}

## User question
${question}

## Answer`;
}
