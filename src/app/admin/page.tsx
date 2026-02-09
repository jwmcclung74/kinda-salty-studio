'use client';

import { useState, useEffect, useCallback } from 'react';

interface Subscriber {
  id: number;
  email: string;
  source: string;
  consent: boolean;
  created_at: string;
}

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [removing, setRemoving] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchSubscribers = useCallback(async (t: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/subscribers?token=${encodeURIComponent(t)}`);
      if (res.status === 401) {
        setAuthenticated(false);
        sessionStorage.removeItem('admin_token');
        setError('Invalid token.');
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to load subscribers.');
        return;
      }
      const data = await res.json();
      setSubscribers(data.subscribers);
      setAuthenticated(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_token');
    if (saved) {
      setToken(saved);
      fetchSubscribers(saved);
    }
  }, [fetchSubscribers]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = tokenInput.trim();
    if (!t) return;
    setToken(t);
    sessionStorage.setItem('admin_token', t);
    await fetchSubscribers(t);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    setToken('');
    setAuthenticated(false);
    setSubscribers([]);
    setTokenInput('');
  };

  const handleRemove = async (id: number, email: string) => {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setConfirmId(null);
    setRemoving(id);
    try {
      const res = await fetch(
        `/api/admin/subscribers?token=${encodeURIComponent(token)}&id=${id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || 'Failed to remove.');
        return;
      }
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      showToast(`Removed ${email}`);
    } catch {
      showToast('Network error.');
    } finally {
      setRemoving(null);
    }
  };

  const filtered = subscribers.filter(
    (s) =>
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.source.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return d;
    }
  };

  // Login screen
  if (!authenticated) {
    return (
      <>
        <head>
          <meta name="robots" content="noindex, nofollow" />
        </head>
        <section className="container-site flex min-h-[60vh] items-center justify-center py-20">
          <div className="w-full max-w-sm">
            <h1 className="section-heading text-center mb-2">Admin</h1>
            <p className="text-center text-salt-500 text-sm mb-8">
              Enter your admin token to continue.
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Admin token"
                className="input-field"
                autoFocus
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Checking...' : 'Log In'}
              </button>
            </form>
          </div>
        </section>
      </>
    );
  }

  // Dashboard
  return (
    <>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 rounded-sm bg-salt-900 px-4 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <section className="container-site py-12">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="section-heading">Admin Dashboard</h1>
            <p className="section-subheading mt-1">
              Manage your site behind the scenes.
            </p>
          </div>
          <button onClick={handleLogout} className="btn-secondary text-xs">
            Log Out
          </button>
        </div>

        {/* Subscribers section */}
        <div className="border border-salt-200 bg-white">
          {/* Section header */}
          <div className="border-b border-salt-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl tracking-tight">
                Mailing List
              </h2>
              <p className="text-sm text-salt-500 mt-0.5">
                {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}
                {search && ` (${filtered.length} shown)`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`/api/admin/export-subscribers?token=${encodeURIComponent(token)}`}
                className="btn-secondary text-xs"
              >
                Export CSV
              </a>
              <button
                onClick={() => fetchSubscribers(token)}
                disabled={loading}
                className="btn-secondary text-xs"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="border-b border-salt-200 px-6 py-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or source..."
              className="input-field"
            />
          </div>

          {/* Table */}
          {error ? (
            <div className="px-6 py-12 text-center text-sm text-red-600">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-salt-500">
              {search ? 'No subscribers match your search.' : 'No subscribers yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-salt-200 text-left text-xs uppercase tracking-wider text-salt-500">
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium hidden sm:table-cell">Source</th>
                    <th className="px-6 py-3 font-medium hidden md:table-cell">Date</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b border-salt-100 hover:bg-salt-50 transition-colors"
                    >
                      <td className="px-6 py-3 font-medium text-salt-900">
                        {sub.email}
                      </td>
                      <td className="px-6 py-3 text-salt-500 hidden sm:table-cell">
                        <span className="rounded-full bg-salt-100 px-2.5 py-0.5 text-xs">
                          {sub.source}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-salt-500 hidden md:table-cell">
                        {formatDate(sub.created_at)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => handleRemove(sub.id, sub.email)}
                          onBlur={() => {
                            if (confirmId === sub.id) setConfirmId(null);
                          }}
                          disabled={removing === sub.id}
                          className={`text-xs font-medium transition-colors ${
                            confirmId === sub.id
                              ? 'text-red-600 hover:text-red-700'
                              : 'text-salt-400 hover:text-red-600'
                          }`}
                        >
                          {removing === sub.id
                            ? 'Removing...'
                            : confirmId === sub.id
                              ? 'Confirm remove?'
                              : 'Remove'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
