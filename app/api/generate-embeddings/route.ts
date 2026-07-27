import { supabase } from '@/lib/supabase';
import { createCoffeeDescription } from '@/services/createCoffeeDescription';
import { generateEmbedding } from '@/services/embeddings';

export async function GET() {
  try {
    // Get all coffee shops
    const { data: coffeeShops, error } = await supabase
      .from('coffee_shops')
      .select('*');

    if (error) {
      throw error;
    }
    console.log('coffeeShops', coffeeShops);
    if (!coffeeShops || coffeeShops.length === 0) {
      return Response.json({
        success: false,
        message: 'No coffee shops found.',
      });
    }

    let processed = 0;

    for (const shop of coffeeShops) {
      // Create a rich description
      const content = createCoffeeDescription(shop);

      // Generate embedding
      const embedding = await generateEmbedding(content);

      // Save to pgvector table
      const { error: insertError } = await supabase
        .from('coffee_shop_chunks')
        .insert({
          coffee_shop_id: shop.id,
          content,
          embedding,
        });

      if (insertError) {
        console.error(`Failed to insert ${shop.name}`, insertError);
        continue;
      }

      processed++;

      console.log(`✅ ${shop.name}`);
    }

    return Response.json({
      success: true,
      processed,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
