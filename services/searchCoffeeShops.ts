import { supabase } from '@/lib/supabase';
import { generateEmbedding } from './embeddings';

export async function searchCoffeeShops(question: string) {
  const embedding = await generateEmbedding(question);

  const { data, error } = await supabase.rpc('match_coffee_shops', {
    query_embedding: embedding,
    match_count: 5,
    similarity_threshold: 0,
  });

  if (error) {
    throw error;
  }

  return data;
}
