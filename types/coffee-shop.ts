// types/coffee-shop.ts

export interface CoffeeShop {
  id: string;
  name: string;
  neighborhood: string;
  address: string | null;
  wifi_score: number | null;
  noise_score: number | null;
  outlet_score: number | null;
  notes: string | null;
}
