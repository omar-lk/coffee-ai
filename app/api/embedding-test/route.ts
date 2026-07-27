import { generateEmbedding } from '@/services/embeddings';

export async function GET() {
  const embedding = await generateEmbedding(
    'Quiet coffee shop with excellent wifi'
  );

  return Response.json({
    dimensions: embedding.length,
    firstTen: embedding.slice(0, 10),
  });
}
