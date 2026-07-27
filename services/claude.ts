import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function askClaude(prompt: string) {
  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL!,
    max_tokens: 1200,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // const textBlock = response.content.find((block) => block.type === 'text');
  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');

  return text;
  // return textBlock?.text ?? 'No response';
}
