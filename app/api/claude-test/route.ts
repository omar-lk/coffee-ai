import { anthropic } from '@/services/claude';

export async function GET() {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: 'Say hello in one sentence.',
      },
    ],
  });

  return Response.json(response.content);
}
