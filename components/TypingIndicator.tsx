import Avatar from './Avatar';

// Assistant "typing…" placeholder shown while awaiting the API response.
export default function TypingIndicator() {
    return (
        <div className="flex items-start gap-3">
            <Avatar role="assistant" />
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-stone-200 bg-white px-4 py-4 shadow-sm">
                <span
                    className="typing-dot h-2 w-2 rounded-full bg-stone-400"
                    style={{ animationDelay: '0ms' }}
                />
                <span
                    className="typing-dot h-2 w-2 rounded-full bg-stone-400"
                    style={{ animationDelay: '150ms' }}
                />
                <span
                    className="typing-dot h-2 w-2 rounded-full bg-stone-400"
                    style={{ animationDelay: '300ms' }}
                />
            </div>
        </div>
    );
}
