'use client';

import { useState, useRef } from 'react';
import { trackEmailSignup } from '@/lib/analytics';

interface EmailSignupProps {
  source: 'homepage' | 'footer';
  variant?: 'default' | 'compact';
}

export function EmailSignup({ source, variant = 'default' }: EmailSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const honeypotRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypotRef.current?.value) return; // Bot caught

    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'You\'re on the list!');
        setEmail('');
        trackEmailSignup(source);
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className={variant === 'compact' ? 'text-sm text-green-600' : 'rounded-sm border border-green-200 bg-green-50 p-4 text-center text-green-800'}>
        ✓ {message}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        {/* Honeypot */}
        <input ref={honeypotRef} type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="input-field flex-1 py-2 text-sm"
          disabled={status === 'loading'}
        />
        <button type="submit" className="btn-primary py-2 text-xs" disabled={status === 'loading'}>
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
        {status === 'error' && <p className="text-xs text-red-500 mt-1">{message}</p>}
      </form>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg">
        <input ref={honeypotRef} type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="input-field flex-1"
          disabled={status === 'loading'}
        />
        <button type="submit" className="btn-primary whitespace-nowrap" disabled={status === 'loading'}>
          {status === 'loading' ? 'Subscribing...' : 'Get Updates'}
        </button>
      </form>
      {status === 'error' && <p className="text-sm text-red-500 mt-2">{message}</p>}
      <p className="text-xs text-salt-400 mt-2">No spam, ever. Unsubscribe anytime.</p>
    </div>
  );
}
