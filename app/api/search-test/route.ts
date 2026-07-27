import { searchCoffeeShops } from '@/services/searchCoffeeShops';

export async function GET() {
  const results = await searchCoffeeShops(' cafe to eat pizza');

  return Response.json(results);
}
