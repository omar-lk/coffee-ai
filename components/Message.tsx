'use client';

import { Message as MessageType } from '@/types/chat';
import Avatar from './Avatar';
import Markdown from './Markdown';
import CoffeeCard from './CoffeeCard';

interface Props {
    message: MessageType;
}

// One chat row: avatar + bubble. Assistant answers also render their source
// coffee cards (from the existing `sources` array) beneath the text.
export default function Message({ message }: Props) {
    const isUser = message.role === 'user';
    const sources = message.sources ?? [];

    return (
        <div
            className={`flex items-start gap-3 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
            }`}
        >
            <Avatar role={message.role} />

            <div
                className={`flex min-w-0 flex-col ${
                    isUser ? 'items-end' : 'items-start'
                } max-w-[85%] sm:max-w-[75%]`}
            >
                <div
                    className={`rounded-2xl px-4 py-3 shadow-sm ${
                        isUser
                            ? 'rounded-tr-md bg-amber-600 text-white'
                            : 'rounded-tl-md border border-stone-200 bg-white text-stone-800'
                    }`}
                >
                    {isUser ? (
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                            {message.content}
                        </p>
                    ) : (
                        <Markdown content={message.content} />
                    )}
                </div>

                {!isUser && sources.length > 0 && (
                    <div className="mt-3 w-full space-y-2.5">
                        <p className="px-1 text-xs font-medium tracking-wide text-stone-400 uppercase">
                            Sources
                        </p>
                        {sources.map((shop) => (
                            <CoffeeCard key={shop.id} shop={shop} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
