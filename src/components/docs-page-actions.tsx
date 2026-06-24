'use client';

import {
  CircleArrowUp,
  Copy,
  Edit,
  ExternalLink,
  MessageCircle,
  ThumbsUp,
} from 'lucide-react';

export function DocsPageActions() {
  const copyPage = () => {
    void navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
  };

  return (
    <nav aria-label="Page actions" className="docs-eve-page-actions">
      <a href="https://github.com/LioRael/lenso-site" target="_blank" rel="noreferrer">
        <Edit aria-hidden="true" />
        <span>Edit this page on GitHub</span>
      </a>
      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <CircleArrowUp aria-hidden="true" />
        <span>Scroll to top</span>
      </button>
      <button type="button">
        <ThumbsUp aria-hidden="true" />
        <span>Give feedback</span>
      </button>
      <button type="button" onClick={copyPage}>
        <Copy aria-hidden="true" />
        <span>Copy page</span>
      </button>
      <button type="button">
        <MessageCircle aria-hidden="true" />
        <span>Ask AI about this page</span>
      </button>
      <a href="https://chat.openai.com/" target="_blank" rel="noreferrer">
        <ExternalLink aria-hidden="true" />
        <span>Open in chat</span>
      </a>
    </nav>
  );
}
