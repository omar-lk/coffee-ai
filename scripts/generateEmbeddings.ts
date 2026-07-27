import { supabase } from '@/lib/supabase';

async function main() {
  const { data, error } = await supabase.from('coffee_shops').select('*');

  if (error) {
    throw error;
  }

  console.log(data);
}

main();
