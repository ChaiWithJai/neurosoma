"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
    content: string;
    className?: string;
}

export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
    return (
        <div className={`markdown-prose ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{

                    // Enhanced headings
                    h1: ({ children }) => (
                        <h1 className="text-xl font-bold mb-3 text-white">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-lg font-semibold mb-2 text-white">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-base font-semibold mb-2 text-slate-200">{children}</h3>
                    ),
                    // Paragraphs with proper spacing
                    p: ({ children }) => (
                        <p className="mb-3 leading-relaxed text-slate-300">{children}</p>
                    ),
                    // Bold text
                    strong: ({ children }) => (
                        <strong className="font-semibold text-white">{children}</strong>
                    ),
                    // Italic text
                    em: ({ children }) => (
                        <em className="italic text-slate-200">{children}</em>
                    ),
                    // Unordered lists
                    ul: ({ children }) => (
                        <ul className="list-none space-y-2 mb-3">{children}</ul>
                    ),
                    // Ordered lists
                    ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-2 mb-3 text-slate-300">{children}</ol>
                    ),
                    // List items with custom bullet
                    li: ({ children }) => (
                        <li className="flex items-start gap-2 text-slate-300">
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 shrink-0" />
                            <span>{children}</span>
                        </li>
                    ),
                    // Code blocks
                    code: ({ children, className }) => {
                        const isInline = !className;
                        return isInline ? (
                            <code className="px-1.5 py-0.5 bg-slate-700 rounded text-cyan-300 text-sm">
                                {children}
                            </code>
                        ) : (
                            <code className="block p-3 bg-slate-800 rounded-lg text-sm overflow-x-auto">
                                {children}
                            </code>
                        );
                    },
                    // Blockquotes
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-cyan-500 pl-4 italic text-slate-400 my-3">
                            {children}
                        </blockquote>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
