'use client';

import { useState } from 'react';
import ChatInput from './ChatInput';
import MessageList from './MessageList';
import { Message } from '@/types/chat';

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);

    async function send() {
        if (!question.trim() || loading) return;

        const userQuestion = question;

        setMessages((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                role: 'user',
                content: userQuestion,
            },
        ]);

        setQuestion('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: userQuestion,
                }),
            });

            const data = await res.json();

            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: data.answer,
                    sources: data.sources,
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-screen">

            <div className="border-b bg-white">
                <div className="max-w-4xl mx-auto py-6">
                    <h1 className="text-3xl font-bold">Finder</h1>
                    <p className="text-zinc-500">
                        AI assistant for finding coffee shops in Marrakech.
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto py-8">

                    {messages.length === 0 ? (
                        <div className="text-center mt-32 text-zinc-500">
                            <h2 className="text-2xl font-semibold">
                                Ask me anything about coffee shops.
                            </h2>

                            <p className="mt-3">
                                Example:
                            </p>

                            <p className="mt-2">
                                "Quiet place with good WiFi in Gueliz"
                            </p>
                        </div>
                    ) : (
                        <MessageList messages={messages} />
                    )}

                </div>
            </div>

            <ChatInput
                value={question}
                loading={loading}
                onChange={setQuestion}
                onSend={send}
            />

        </div>
    );
}