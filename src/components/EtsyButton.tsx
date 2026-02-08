'use client';

import { trackViewOnEtsy } from '@/lib/analytics';

interface EtsyButtonProps {
  url: string;
  title: string;
  size?: 'small' | 'default';
}

export function EtsyButton({ url, title, size = 'default' }: EtsyButtonProps) {
  function handleClick() {
    trackViewOnEtsy(title, url);
  }

  if (size === 'small') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="inline-flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-accent-dark"
      >
        Buy on Etsy
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="btn-primary w-full text-center"
    >
      Buy on Etsy
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}
