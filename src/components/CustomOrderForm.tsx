'use client';

import { useState, useRef } from 'react';
import { trackCustomOrderSubmit } from '@/lib/analytics';

const MAX_FILES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function CustomOrderForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    const combined = [...files, ...selected].slice(0, MAX_FILES);

    for (const file of combined) {
      if (file.size > MAX_FILE_SIZE) {
        setStatus('error');
        setMessage(`"${file.name}" exceeds the 5MB limit.`);
        return;
      }
    }

    setFiles(combined);
    setStatus('idle');
    setMessage('');
    // Reset input so re-selecting the same file works
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (honeypotRef.current?.value) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Remove the raw file input entries and add our managed files
    formData.delete('fileInput');
    files.forEach((file, i) => formData.append(`file${i}`, file));

    setStatus('loading');
    try {
      const res = await fetch('/api/custom-order', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(json.message || 'Request submitted!');
        trackCustomOrderSubmit();
        form.reset();
        setFiles([]);
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

      {/* File upload */}
      <div>
        <label className="block text-sm font-medium text-salt-700 mb-1">
          Attachments <span className="font-normal text-salt-400">(optional, up to 3 files, 5MB each)</span>
        </label>
        <p className="text-xs text-salt-500 mb-2">
          Upload images, PDFs, or documents to help describe your project.
        </p>
        {files.length < MAX_FILES && (
          <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-salt-300 px-4 py-2 text-sm text-salt-700 transition-colors hover:border-salt-400 hover:bg-salt-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            Choose File
            <input
              ref={fileInputRef}
              type="file"
              name="fileInput"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
            />
          </label>
        )}
        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((file, i) => (
              <li key={`${file.name}-${i}`} className="flex items-center gap-3 rounded border border-salt-200 bg-salt-50 px-3 py-2 text-sm">
                {file.type.startsWith('image/') ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-salt-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-salt-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                )}
                <span className="truncate flex-1 text-salt-700">{file.name}</span>
                <span className="text-xs text-salt-400 shrink-0">{formatSize(file.size)}</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-salt-400 hover:text-red-500 transition-colors shrink-0"
                  aria-label={`Remove ${file.name}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {status === 'error' && <p className="text-sm text-red-500">{message}</p>}
      <button type="submit" className="btn-primary" disabled={status === 'loading'}>
        {status === 'loading' ? 'Submitting...' : 'Submit Custom Order Request'}
      </button>
    </form>
  );
}
