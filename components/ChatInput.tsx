'use client';

import { useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';

interface Props {
    value: string;
    loading: boolean;
    onChange: (value: string) => void;
    onSend: () => void;
}

// Fixed composer at the bottom. Auto-growing textarea; Enter sends,
// Shift+Enter inserts a newline.
export default function ChatInput({ value, loading, onChange, onSend }: Props) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Grow the textarea with its content, up to a max height.
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }, [value]);

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    }

    const canSend = value.trim().length > 0 && !loading;

    return (
        <div className="sticky bottom-0 shrink-0 border-t border-stone-200 bg-stone-50/90 backdrop-blur">
            <div className="mx-auto max-w-3xl px-4 py-3.5">
                <div className="flex items-end gap-2 rounded-2xl border border-stone-300 bg-white p-2 shadow-sm focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        placeholder="Ask about coffee shops in Marrakech…"
                        className="max-h-[200px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] text-stone-900 placeholder:text-stone-400 focus:outline-none"
                    />
                    <button
                        onClick={onSend}
                        disabled={!canSend}
                        aria-label="Send message"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-stone-300"
                    >
                        <ArrowUp size={18} />
                    </button>
                </div>
                <p className="mt-1.5 px-1 text-center text-xs text-stone-400">
                    Press Enter to send · Shift + Enter for a new line
                </p>
            </div>
        </div>
    );
}
