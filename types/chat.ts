export interface CoffeeShop {
  id: string;
  coffee_shop_id: string;
  name: string;
  neighborhood: string;
  address: string;
  wifi_score: number;
  noise_score: number;
  outlet_score: number | null;
  notes: string | null;
  similarity: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: CoffeeShop[];
}
