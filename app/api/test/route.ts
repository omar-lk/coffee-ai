// src/app/api/test/route.ts

import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase.from('coffee_shops').select('*');

  return Response.json({
    data,
    error,
  });
}
