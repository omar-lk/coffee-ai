'use client';

import { Coffee, MapPin, Wifi, Plug } from 'lucide-react';
import { CoffeeShop } from '@/types/chat';

interface Props {
    shop: CoffeeShop;
}

export default function CoffeeCard({ shop }: Props) {
    return (
        <div className="rounded-xl border border-zinc-200 p-4 bg-zinc-50">

            <div className="flex items-center gap-2">
                <Coffee size={18} />
                <h3 className="font-semibold">{shop.name}</h3>
            </div>

            <div className="flex items-center gap-2 mt-2 text-sm text-zinc-600">
                <MapPin size={15} />
                {shop.neighborhood}
            </div>

            <div className="flex flex-wrap gap-5 mt-4 text-sm">

                <div className="flex items-center gap-1">
                    <Wifi size={15} />
                    {shop.wifi_score}/5
                </div>

                <div>
                    🔇 {shop.noise_score}/5
                </div>

                <div className="flex items-center gap-1">
                    <Plug size={15} />
                    {shop.outlet_score ?? '-'}
                </div>

            </div>

            {shop.notes && (
                <p className="text-sm text-zinc-600 mt-3">
                    {shop.notes}
                </p>
            )}

        </div>
    );
}