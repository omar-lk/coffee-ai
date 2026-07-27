import { searchCoffeeShops } from './searchCoffeeShops';
import { buildPrompt } from './buildPrompt';
import { askClaude } from './claude';
import { analyzeQuestion } from './analyzeQuestion';

export async function chat(question: string) {
  const sources = await searchCoffeeShops(question);

  // Only say "I don't know" when retrieval returns nothing to recommend.
  // With candidates present, buildPrompt instructs Claude to rank and recommend.
  if (!sources || sources.length === 0) {
    return {
      answer:
        "I don't know — I couldn't find any coffee shops matching your question.",
      sources: [],
    };
  }

  const preferences = analyzeQuestion(question);

  const prompt = buildPrompt(question, sources, preferences);

  const answer = await askClaude(prompt);

  return {
    answer,
    sources,
  };
}
