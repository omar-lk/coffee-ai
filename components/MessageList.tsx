'use client';

import { useEffect, useRef } from 'react';
import { Message as MessageType } from '@/types/chat';
import Message from './Message';
import TypingIndicator from './TypingIndicator';

interface Props {
    messages: MessageType[];
    loading: boolean;
}

// Scrollable transcript. Owns auto-scroll: whenever a message is added or the
// loading state flips, it scrolls the bottom sentinel into view.
export default function MessageList({ messages, loading }: Props) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
            {messages.map((message) => (
                <Message key={message.id} message={message} />
            ))}

            {loading && <TypingIndicator />}

            <div ref={bottomRef} />
        </div>
    );
}
