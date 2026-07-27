'use client';

import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';
import { Message as MessageType } from '@/types/chat';
import CoffeeCard from './CoffeeCard';

interface Props {
    message: MessageType;
}

export default function Message({ message }: Props) {
    const isUser = message.role === 'user';

    return (
        <div
            className={`flex gap-4 mb-8 ${isUser ? 'justify-end' : 'justify-start'
                }`}
        >
            {!isUser && (
                <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center shrink-0">
                    <Bot size={18} />
                </div>
            )}

            <div
                className={`max-w-2xl rounded-2xl px-5 py-4 shadow-sm ${isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-zinc-200'
                    }`}
            >
                <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>

                {message.sources && message.sources.length > 0 && (
                    <div className="mt-5 space-y-3">
                        {message.sources.map((shop) => (
                            <CoffeeCard key={shop.id} shop={shop} />
                        ))}
                    </div>
                )}
            </div>

            {isUser && (
                <div className="w-10 h-10 rounded-full bg-zinc-300 flex items-center justify-center shrink-0">
                    <User size={18} />
                </div>
            )}
        </div>
    );
}