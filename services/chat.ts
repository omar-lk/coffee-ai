import { searchCoffeeShops } from './searchCoffeeShops';
import { buildPrompt } from './buildPrompt';
import { askClaude } from './claude';

export async function chat(question: string) {
  const sources = await searchCoffeeShops(question);

  const prompt = buildPrompt(question, sources);

  const answer = await askClaude(prompt);

  return {
    answer,
    sources,
  };
}
