'use client';

import { useState, useRef } from 'react';
import { trackCustomOrderSubmit } from '@/lib/analytics';

export function CustomOrderForm() {
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
      const res = await fetch('/api/custom-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(json.message || 'Request submitted!');
        trackCustomOrderSubmit();
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
        <p className="font-semibold">Custom order request received!</p>
        <p className="text-sm mt-1">We&apos;ll review your request and get back to you within 1–2 business days.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input ref={honeypotRef} type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="co-name" className="block text-sm font-medium text-salt-700 mb-1">Name</label>
          <input id="co-name" name="name" required className="input-field" />
        </div>
        <div>
          <label htmlFor="co-email" className="block text-sm font-medium text-salt-700 mb-1">Email</label>
          <input id="co-email" name="email" type="email" required className="input-field" />
        </div>
      </div>
      <div>
        <label htmlFor="co-type" className="block text-sm font-medium text-salt-700 mb-1">Type of Project</label>
        <select id="co-type" name="projectType" required className="input-field">
          <option value="">Select one…</option>
          <option value="3d-print">3D Print</option>
          <option value="laser-engraving">Laser Engraving</option>
          <option value="laser-cutting">Laser Cutting</option>
          <option value="both">Both / Combination</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="co-budget" className="block text-sm font-medium text-salt-700 mb-1">Budget Range (optional)</label>
        <select id="co-budget" name="budget" className="input-field">
          <option value="">Prefer not to say</option>
          <option value="under-25">Under $25</option>
          <option value="25-50">$25 – $50</option>
          <option value="50-100">$50 – $100</option>
          <option value="100-250">$100 – $250</option>
          <option value="250+">$250+</option>
        </select>
      </div>
      <div>
        <label htmlFor="co-timeline" className="block text-sm font-medium text-salt-700 mb-1">Timeline (optional)</label>
        <input id="co-timeline" name="timeline" placeholder="e.g., Need by Dec 15" className="input-field" />
      </div>
      <div>
        <label htmlFor="co-description" className="block text-sm font-medium text-salt-700 mb-1">Describe Your Project</label>
        <textarea id="co-description" name="description" rows={6} required className="input-field" placeholder="Tell us about your idea — dimensions, colors, quantity, reference images, etc." />
      </div>
      {status === 'error' && <p className="text-sm text-red-500">{message}</p>}
      <button type="submit" className="btn-primary" disabled={status === 'loading'}>
        {status === 'loading' ? 'Submitting...' : 'Submit Custom Order Request'}
      </button>
    </form>
  );
}
