'use client';

import { useState, useRef } from 'react';
import { trackContactSubmit } from '@/lib/analytics';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const honeypotRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (honeypotRef.current?.value) return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(json.message || 'Message sent!');
        trackContactSubmit();
        form.reset();
      } else {
        setStatus('error');
        setMessage(json.error || 'Failed to send.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error.');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-sm border border-green-200 bg-green-50 p-6 text-center text-green-800">
        <p className="font-semibold">Message sent!</p>
        <p className="text-sm mt-1">We&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input ref={honeypotRef} type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div>
        <label htmlFor="c-name" className="block text-sm font-medium text-salt-700 mb-1">Name</label>
        <input id="c-name" name="name" required className="input-field" />
      </div>
      <div>
        <label htmlFor="c-email" className="block text-sm font-medium text-salt-700 mb-1">Email</label>
        <input id="c-email" name="email" type="email" required className="input-field" />
      </div>
      <div>
        <label htmlFor="c-subject" className="block text-sm font-medium text-salt-700 mb-1">Subject</label>
        <input id="c-subject" name="subject" required className="input-field" />
      </div>
      <div>
        <label htmlFor="c-message" className="block text-sm font-medium text-salt-700 mb-1">Message</label>
        <textarea id="c-message" name="message" rows={5} required className="input-field" />
      </div>
      {status === 'error' && <p className="text-sm text-red-500">{message}</p>}
      <button type="submit" className="btn-primary" disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
