import { CoffeeShop } from '@/types/coffee-shop';

export function createCoffeeDescription(shop: CoffeeShop): string {
  return `
${shop.name} is a specialty coffee shop located in ${shop.neighborhood}, Marrakech.

Address: ${shop.address ?? 'Unknown'}.

This coffee shop has:
- WiFi score: ${shop.wifi_score ?? 'Unknown'}/5
- Noise score: ${shop.noise_score ?? 'Unknown'}/5
- Power outlet score: ${shop.outlet_score ?? 'Unknown'}/5

Customer notes:
${shop.notes ?? 'No additional notes.'}

This place may be suitable for people looking for coffee, remote work, studying, meetings, or relaxing.
`;
}
