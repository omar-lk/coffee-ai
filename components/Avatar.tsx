import { Coffee, User } from 'lucide-react';

interface Props {
    role: 'user' | 'assistant';
}

// Small circular avatar shown next to each chat bubble.
export default function Avatar({ role }: Props) {
    const isUser = role === 'user';

    return (
        <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm ${
                isUser
                    ? 'bg-stone-200 text-stone-600'
                    : 'bg-amber-600 text-white'
            }`}
            aria-hidden="true"
        >
            {isUser ? <User size={18} /> : <Coffee size={18} />}
        </div>
    );
}
