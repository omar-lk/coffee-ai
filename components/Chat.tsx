'use client';

import { useState } from 'react';
import { Message } from '@/types/chat';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import EmptyState from './EmptyState';

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);

    async function sendQuestion(text: string) {
        const userQuestion = text.trim();
        if (!userQuestion || loading) return;

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
            // API contract unchanged: POST { question } → { answer, sources }.
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: userQuestion }),
            });

            if (!res.ok) {
                throw new Error(`Request failed (${res.status})`);
            }

            const data = await res.json();

            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: data.answer ?? "I don't know.",
                    sources: data.sources,
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content:
                        'Sorry — something went wrong reaching the assistant. Please try again.',
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    const isEmpty = messages.length === 0 && !loading;

    return (
        <div className="flex h-dvh flex-col">
            <ChatHeader />

            <main className="scrollbar-thin flex-1 overflow-y-auto">
                {isEmpty ? (
                    <EmptyState onExample={sendQuestion} />
                ) : (
                    <MessageList messages={messages} loading={loading} />
                )}
            </main>

            <ChatInput
                value={question}
                loading={loading}
                onChange={setQuestion}
                onSend={() => sendQuestion(question)}
            />
        </div>
    );
}
