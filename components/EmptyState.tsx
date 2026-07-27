'use client';

import { Coffee } from 'lucide-react';

interface Props {
    onExample: (text: string) => void;
}

const EXAMPLES = [
    'Quiet place with good WiFi in Gueliz',
    'Best coffee for remote work with lots of outlets',
    'Cozy spot with a nice atmosphere in the Medina',
];

// Shown before the first message: welcome + clickable example prompts.
export default function EmptyState({ onExample }: Props) {
    return (
        <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:py-24">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-sm">
                <Coffee size={26} />
            </div>

            <h2 className="mt-6 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
                Find your next coffee shop
            </h2>
            <p className="mt-2 max-w-md text-stone-500">
                Ask me anything about coffee shops in Marrakech — WiFi, noise,
                outlets, neighborhood, or vibe.
            </p>

            <div className="mt-8 grid w-full gap-2.5 sm:grid-cols-1">
                {EXAMPLES.map((example) => (
                    <button
                        key={example}
                        onClick={() => onExample(example)}
                        className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-left text-sm text-stone-700 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50/50"
                    >
                        {example}
                    </button>
                ))}
            </div>
        </div>
    );
}
