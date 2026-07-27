'use client';

import { Coffee, MapPin, Wifi, Plug, Volume2 } from 'lucide-react';
import { CoffeeShop } from '@/types/chat';

interface Props {
    shop: CoffeeShop;
}

function Stat({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-stone-600 ring-1 ring-stone-200">
            <span className="text-amber-600">{icon}</span>
            <span className="text-stone-400">{label}</span>
            <span className="text-stone-800">{value}</span>
        </div>
    );
}

// A single retrieved coffee shop, rendered as a source card under an answer.
export default function CoffeeCard({ shop }: Props) {
    const score = (n: number | null | undefined) =>
        typeof n === 'number' ? `${n}/5` : '—';

    return (
        <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 transition-colors hover:border-amber-200 hover:bg-amber-50/40">
            <div className="flex items-center gap-2">
                <Coffee size={16} className="text-amber-700" />
                <h3 className="font-semibold text-stone-900">{shop.name}</h3>
            </div>

            {shop.neighborhood && (
                <div className="mt-1.5 flex items-center gap-1.5 text-sm text-stone-500">
                    <MapPin size={14} />
                    {shop.neighborhood}
                </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
                <Stat icon={<Wifi size={13} />} label="WiFi" value={score(shop.wifi_score)} />
                <Stat
                    icon={<Volume2 size={13} />}
                    label="Noise"
                    value={score(shop.noise_score)}
                />
                <Stat
                    icon={<Plug size={13} />}
                    label="Outlets"
                    value={score(shop.outlet_score)}
                />
            </div>

            {shop.notes && (
                <p className="mt-3 text-sm leading-relaxed text-stone-600">
                    {shop.notes}
                </p>
            )}
        </div>
    );
}
