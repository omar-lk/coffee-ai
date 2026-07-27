import { chat } from '@/services/chat';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.question) {
      return Response.json({ error: 'Question is required' }, { status: 400 });
    }

    const result = await chat(body.question);

    return Response.json(result);
  } catch (error) {
    console.error(error);

    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
