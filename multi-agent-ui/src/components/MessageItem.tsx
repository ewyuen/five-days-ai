'use client';

import React, { useState } from 'react';
import { UIMessage } from 'ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Bot, User, Brain } from 'lucide-react';

interface MessageItemProps {
  message: UIMessage;
}

export default function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';

  // Extract text and reasoning parts from UIMessage.parts
  const textContent = message.parts
    ? message.parts
        .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
        .map((part) => part.text)
        .join('')
    : (message as any).content || '';

  const reasoningContent = message.parts
    ? message.parts
        .filter((part): part is { type: 'reasoning'; text: string } => part.type === 'reasoning')
        .map((part) => part.text)
        .join('')
    : '';

  return (
    <div className={`flex w-full gap-4 py-6 px-4 md:px-6 transition-colors duration-200 ${
      isUser ? 'bg-transparent flex-row-reverse' : 'bg-zinc-900/20 border-y border-zinc-900/50 backdrop-blur-sm'
    }`}>
      {/* Avatar */}
      <div className={`flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl shadow-lg transition-transform hover:scale-105 ${
        isUser 
          ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-indigo-500/10' 
          : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/10'
      }`}>
        {isUser ? (
          <User className="h-4.5 w-4.5" />
        ) : (
          <Bot className="h-4.5 w-4.5" />
        )}
      </div>

      {/* Message Bubble Container */}
      <div className={`flex flex-col max-w-[85%] md:max-w-[75%] gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Role label & Timestamp */}
        <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wider uppercase text-zinc-500">
          <span>{isUser ? 'You' : 'Assistant'}</span>
          <span>•</span>
          <span>{new Date((message as any).createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Content */}
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed border transition-all ${
          isUser 
            ? 'bg-gradient-to-br from-indigo-600/90 to-blue-600/90 border-indigo-500/40 text-white shadow-lg shadow-indigo-600/5' 
            : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-100'
        }`}>
          {/* Render reasoning if present */}
          {!isUser && reasoningContent && (
            <div className="mb-3 rounded-xl border border-zinc-850 bg-zinc-950/60 p-3 text-xs text-zinc-500 font-mono">
              <div className="flex items-center gap-1.5 font-bold text-zinc-400 mb-1">
                <Brain className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
                <span>Thought Process</span>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">{reasoningContent}</div>
            </div>
          )}

          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{textContent}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Code block customization
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match;
                    const codeString = String(children).replace(/\n$/, '');

                    if (isInline) {
                      return (
                        <code 
                          className="bg-zinc-950/80 text-pink-400 font-mono text-xs px-1.5 py-0.5 rounded border border-zinc-800" 
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    return (
                      <CodeBlock 
                        language={match[1]} 
                        value={codeString} 
                      />
                    );
                  },
                  p({ children }) {
                    return <p className="mb-3 last:mb-0 text-zinc-200 leading-relaxed">{children}</p>;
                  },
                  a({ href, children }) {
                    return (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4 decoration-indigo-500/40 hover:decoration-indigo-400 transition-colors"
                      >
                        {children}
                      </a>
                    );
                  },
                  ul({ children }) {
                    return <ul className="list-disc pl-5 mb-3 space-y-1 text-zinc-300">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="list-decimal pl-5 mb-3 space-y-1 text-zinc-300">{children}</ol>;
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-2 border-indigo-500 bg-zinc-950/20 pl-4 py-1 my-3 text-zinc-400 italic rounded-r-md">
                        {children}
                      </blockquote>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto w-full my-4 rounded-xl border border-zinc-850">
                        <table className="min-w-full border-collapse bg-zinc-950/20">{children}</table>
                      </div>
                    );
                  },
                  thead({ children }) {
                    return <thead className="bg-zinc-900/50 border-b border-zinc-800">{children}</thead>;
                  },
                  th({ children }) {
                    return <th className="px-4 py-2.5 text-left text-xs font-semibold text-zinc-300">{children}</th>;
                  },
                  td({ children }) {
                    return <td className="px-4 py-2.5 text-xs text-zinc-400 border-t border-zinc-900">{children}</td>;
                  },
                  h1({ children }) {
                    return <h1 className="text-xl font-bold text-white mt-4 mb-2 first:mt-0">{children}</h1>;
                  },
                  h2({ children }) {
                    return <h2 className="text-lg font-bold text-white mt-4 mb-2 first:mt-0">{children}</h2>;
                  },
                  h3({ children }) {
                    return <h3 className="text-base font-bold text-white mt-3 mb-1 first:mt-0">{children}</h3>;
                  },
                }}
              >
                {textContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CodeBlockProps {
  language: string;
  value: string;
}

function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[CodeBlock] Copy failed:', err);
    }
  };

  return (
    <div className="relative border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 my-4 shadow-xl">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-900 bg-zinc-900/40 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-indigo-500/80 animate-pulse" />
          <span className="text-xs font-semibold font-mono text-zinc-400 capitalize">
            {language || 'code'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-all bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800/80 hover:border-zinc-700 active:scale-95"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code block scrollable container */}
      <div className="overflow-x-auto max-w-full">
        <pre className="p-4 text-xs md:text-sm font-mono text-zinc-200 leading-relaxed scrollbar-thin">
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
}
