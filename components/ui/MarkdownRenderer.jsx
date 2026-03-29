'use client'

import ReactMarkdown from 'react-markdown'

export default function MarkdownRenderer({ content }) {
  return (
    <div className="prose prose-invert max-w-none text-sm leading-relaxed prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
