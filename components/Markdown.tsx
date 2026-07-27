import ReactMarkdown, { type Components } from 'react-markdown';

// Reusable Markdown renderer with hand-tuned typography.
// The project has no @tailwindcss/typography plugin, so we map each element to
// Tailwind classes here instead of relying on `prose`.
const components: Components = {
    p: ({ children }) => (
        <p className="my-2 leading-relaxed first:mt-0 last:mb-0">{children}</p>
    ),
    ul: ({ children }) => (
        <ul className="my-2 list-disc space-y-1 pl-5 marker:text-amber-600">
            {children}
        </ul>
    ),
    ol: ({ children }) => (
        <ol className="my-2 list-decimal space-y-1 pl-5 marker:text-stone-400">
            {children}
        </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    strong: ({ children }) => (
        <strong className="font-semibold text-stone-900">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    a: ({ href, children }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-amber-700 underline underline-offset-2 hover:text-amber-800"
        >
            {children}
        </a>
    ),
    h1: ({ children }) => (
        <h1 className="mt-4 mb-2 text-xl font-bold first:mt-0">{children}</h1>
    ),
    h2: ({ children }) => (
        <h2 className="mt-4 mb-2 text-lg font-bold first:mt-0">{children}</h2>
    ),
    h3: ({ children }) => (
        <h3 className="mt-3 mb-1 text-base font-semibold first:mt-0">
            {children}
        </h3>
    ),
    blockquote: ({ children }) => (
        <blockquote className="my-2 border-l-2 border-amber-300 pl-3 text-stone-600 italic">
            {children}
        </blockquote>
    ),
    code: ({ children }) => (
        <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[0.85em] text-stone-800">
            {children}
        </code>
    ),
    pre: ({ children }) => (
        <pre className="my-3 overflow-x-auto rounded-lg bg-stone-900 p-3 text-sm text-stone-100 [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-stone-100">
            {children}
        </pre>
    ),
    hr: () => <hr className="my-4 border-stone-200" />,
};

interface Props {
    content: string;
}

export default function Markdown({ content }: Props) {
    return (
        <div className="text-[15px] text-stone-800">
            <ReactMarkdown components={components}>{content}</ReactMarkdown>
        </div>
    );
}
