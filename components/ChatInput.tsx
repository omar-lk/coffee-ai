'use client';

interface Props {
    value: string;
    loading: boolean;
    onChange: (value: string) => void;
    onSend: () => void;
}

export default function ChatInput({
    value,
    loading,
    onChange,
    onSend,
}: Props) {
    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            onSend();
        }
    }

    return (
        <div className="sticky bottom-0 bg-white border-t border-zinc-200 p-6">
            <div className="max-w-4xl mx-auto flex gap-3">

                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Coffee AI..."
                    className="flex-1 rounded-xl border border-zinc-300 px-5 py-4 outline-none focus:border-blue-500"
                />

                <button
                    onClick={onSend}
                    disabled={loading}
                    className="rounded-xl bg-blue-600 text-white px-6 font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? '...' : 'Send'}
                </button>

            </div>
        </div>
    );
}