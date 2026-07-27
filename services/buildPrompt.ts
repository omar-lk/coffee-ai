import { QuestionPreferences } from './analyzeQuestion';

// A retrieved candidate. `content` is the rich description that was embedded
// (name, neighborhood, scores, notes), so it's always safe to show even if the
// RPC doesn't return the individual shop columns. `similarity` / `name` are used
// when present but never required.
export interface RetrievedShop {
  content: string;
  similarity?: number;
  name?: string;
}

function formatCandidate(shop: RetrievedShop, index: number): string {
  const heading = shop.name ? shop.name : `Candidate ${index + 1}`;
  const relevance =
    typeof shop.similarity === 'number'
      ? ` (relevance: ${shop.similarity.toFixed(2)})`
      : '';

  return `### ${index + 1}. ${heading}${relevance}
${shop.content.trim()}`;
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
