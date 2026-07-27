import { Coffee } from 'lucide-react';

// Sticky top bar with the app identity.
export default function ChatHeader() {
    return (
        <header className="sticky top-0 z-10 shrink-0 border-b border-stone-200 bg-stone-50/80 backdrop-blur">
            <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 text-white shadow-sm">
                    <Coffee size={18} />
                </div>
                <div className="leading-tight">
                    <h1 className="text-base font-semibold tracking-tight text-stone-900">
                        Coffee AI
                    </h1>
                    <p className="text-xs text-stone-500">
                        Marrakech coffee shop finder
                    </p>
                </div>
            </div>
        </header>
    );
}
