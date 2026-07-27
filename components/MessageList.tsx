'use client';

import { Message as MessageType } from '@/types/chat';
import Message from './Message';

interface Props {
    messages: MessageType[];
}

export default function MessageList({ messages }: Props) {
    return (
        <div className="flex flex-col gap-2">
            {messages.map((message) => (
                <Message
                    key={message.id}
                    message={message}
                />
            ))}
        </div>
    );
}