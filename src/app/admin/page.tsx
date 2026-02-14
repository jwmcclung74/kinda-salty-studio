'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminPanel } from '@/components/AdminPanel';

interface Subscriber {
  id: number;
  email: string;
  source: string;
  consent: boolean;
  created_at: string;
}

interface CustomOrder {
  id: number;
  name: string;
  email: string;
  project_type: string;
  budget: string | null;
  timeline: string | null;
  description: string;
  file_count?: number;
  files?: { name: string; type: string; size: number; data: string }[];
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<'subscribers' | 'orders' | 'listings'>('subscribers');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
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

  const fetchOrders = useCallback(async (t: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/custom-orders?token=${encodeURIComponent(t)}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to load orders.');
        return;
      }
      const data = await res.json();
      setOrders(data.orders);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrderDetail = useCallback(async (t: string, id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/custom-orders?token=${encodeURIComponent(t)}&id=${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setSelectedOrder(data.order);
    } catch {
      showToast('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/custom-orders?token=${encodeURIComponent(token)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
        if (selectedOrder?.id === id) setSelectedOrder((prev) => prev ? { ...prev, status } : prev);
        showToast('Status updated.');
      }
    } catch {
      showToast('Failed to update status.');
    }
  };

  // Parse URL params on mount for deep linking from email
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTab = params.get('tab');
    if (urlTab === 'orders') setTab('orders');
    if (urlTab === 'listings') setTab('listings');
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_token');
    if (saved) {
      setToken(saved);
      fetchSubscribers(saved);
    }
  }, [fetchSubscribers]);

  // Fetch orders when switching to orders tab
  useEffect(() => {
    if (authenticated && tab === 'orders' && orders.length === 0) {
      fetchOrders(token);
    }
  }, [authenticated, tab, token, orders.length, fetchOrders]);

  // Auto-open order detail from URL param
  useEffect(() => {
    if (authenticated && tab === 'orders' && token) {
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get('order');
      if (orderId && !selectedOrder) {
        fetchOrderDetail(token, parseInt(orderId, 10));
      }
    }
  }, [authenticated, tab, token, selectedOrder, fetchOrderDetail]);

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
    setOrders([]);
    setSelectedOrder(null);
    setTokenInput('');
  };

  const handleRemoveSubscriber = async (id: number, email: string) => {
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

  const handleRemoveOrder = async (id: number) => {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setConfirmId(null);
    setRemoving(id);
    try {
      const res = await fetch(
        `/api/admin/custom-orders?token=${encodeURIComponent(token)}&id=${id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || 'Failed to remove.');
        return;
      }
      setOrders((prev) => prev.filter((o) => o.id !== id));
      if (selectedOrder?.id === id) setSelectedOrder(null);
      showToast('Order removed.');
    } catch {
      showToast('Network error.');
    } finally {
      setRemoving(null);
    }
  };

  const filteredSubscribers = subscribers.filter(
    (s) =>
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.source.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase()) ||
      o.project_type.toLowerCase().includes(search.toLowerCase()) ||
      o.status.toLowerCase().includes(search.toLowerCase())
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

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    reviewed: 'bg-yellow-100 text-yellow-700',
    quoted: 'bg-purple-100 text-purple-700',
    'in-progress': 'bg-orange-100 text-orange-700',
    completed: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
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

  // Order detail view
  if (selectedOrder) {
    return (
      <>
        <head>
          <meta name="robots" content="noindex, nofollow" />
        </head>
        {toast && (
          <div className="fixed top-20 right-4 z-50 rounded-sm bg-salt-900 px-4 py-3 text-sm text-white shadow-lg">
            {toast}
          </div>
        )}
        <section className="container-site py-12">
          <button
            onClick={() => setSelectedOrder(null)}
            className="text-sm text-salt-500 hover:text-salt-700 mb-6 inline-flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Orders
          </button>

          <div className="border border-salt-200 bg-white">
            <div className="border-b border-salt-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl tracking-tight">
                  Order #{selectedOrder.id}
                </h2>
                <p className="text-sm text-salt-500 mt-0.5">
                  {formatDate(selectedOrder.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  className="input-field text-sm py-1.5"
                >
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="quoted">Quoted</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-salt-400 mb-1">Name</p>
                  <p className="text-salt-900">{selectedOrder.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-salt-400 mb-1">Email</p>
                  <a href={`mailto:${selectedOrder.email}`} className="text-accent hover:underline">
                    {selectedOrder.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-salt-400 mb-1">Project Type</p>
                  <p className="text-salt-900">{selectedOrder.project_type}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-salt-400 mb-1">Budget</p>
                  <p className="text-salt-900">{selectedOrder.budget || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-salt-400 mb-1">Timeline</p>
                  <p className="text-salt-900">{selectedOrder.timeline || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-salt-400 mb-1">Status</p>
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[selectedOrder.status] || 'bg-salt-100 text-salt-700'}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-salt-400 mb-2">Description</p>
                <div className="rounded border border-salt-200 bg-salt-50 p-4 text-sm text-salt-700 whitespace-pre-wrap">
                  {selectedOrder.description}
                </div>
              </div>

              {/* Attachments */}
              {selectedOrder.files && selectedOrder.files.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-salt-400 mb-2">
                    Attachments ({selectedOrder.files.length})
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {selectedOrder.files.map((file, i) => {
                      const isImage = file.type.startsWith('image/');
                      const dataUrl = `data:${file.type};base64,${file.data}`;
                      return (
                        <div key={i} className="rounded border border-salt-200 overflow-hidden">
                          {isImage ? (
                            <a href={dataUrl} target="_blank" rel="noopener noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={dataUrl}
                                alt={file.name}
                                className="w-full h-40 object-cover bg-salt-100"
                              />
                            </a>
                          ) : (
                            <div className="h-40 flex items-center justify-center bg-salt-50">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-salt-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="px-3 py-2 border-t border-salt-200">
                            <p className="text-xs text-salt-700 truncate">{file.name}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-salt-400">{(file.size / 1024).toFixed(1)} KB</p>
                              <a
                                href={dataUrl}
                                download={file.name}
                                className="text-xs text-accent hover:underline"
                              >
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
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

        {/* Tab navigation */}
        <div className="flex gap-1 border-b border-salt-200 mb-6">
          <button
            onClick={() => { setTab('subscribers'); setSearch(''); setError(''); }}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === 'subscribers'
                ? 'border-accent text-accent'
                : 'border-transparent text-salt-500 hover:text-salt-700'
            }`}
          >
            Mailing List
          </button>
          <button
            onClick={() => { setTab('orders'); setSearch(''); setError(''); }}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === 'orders'
                ? 'border-accent text-accent'
                : 'border-transparent text-salt-500 hover:text-salt-700'
            }`}
          >
            Custom Orders
            {orders.filter((o) => o.status === 'new').length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-accent text-white text-xs w-5 h-5">
                {orders.filter((o) => o.status === 'new').length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setTab('listings'); setSearch(''); setError(''); }}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === 'listings'
                ? 'border-accent text-accent'
                : 'border-transparent text-salt-500 hover:text-salt-700'
            }`}
          >
            Listings
          </button>
        </div>

        {/* ===================== SUBSCRIBERS TAB ===================== */}
        {tab === 'subscribers' && (
          <div className="border border-salt-200 bg-white">
            <div className="border-b border-salt-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl tracking-tight">Mailing List</h2>
                <p className="text-sm text-salt-500 mt-0.5">
                  {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}
                  {search && ` (${filteredSubscribers.length} shown)`}
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

            <div className="border-b border-salt-200 px-6 py-3">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email or source..."
                className="input-field"
              />
            </div>

            {error ? (
              <div className="px-6 py-12 text-center text-sm text-red-600">{error}</div>
            ) : filteredSubscribers.length === 0 ? (
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
                    {filteredSubscribers.map((sub) => (
                      <tr
                        key={sub.id}
                        className="border-b border-salt-100 hover:bg-salt-50 transition-colors"
                      >
                        <td className="px-6 py-3 font-medium text-salt-900">{sub.email}</td>
                        <td className="px-6 py-3 text-salt-500 hidden sm:table-cell">
                          <span className="rounded-full bg-salt-100 px-2.5 py-0.5 text-xs">{sub.source}</span>
                        </td>
                        <td className="px-6 py-3 text-salt-500 hidden md:table-cell">{formatDate(sub.created_at)}</td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => handleRemoveSubscriber(sub.id, sub.email)}
                            onBlur={() => { if (confirmId === sub.id) setConfirmId(null); }}
                            disabled={removing === sub.id}
                            className={`text-xs font-medium transition-colors ${
                              confirmId === sub.id
                                ? 'text-red-600 hover:text-red-700'
                                : 'text-salt-400 hover:text-red-600'
                            }`}
                          >
                            {removing === sub.id ? 'Removing...' : confirmId === sub.id ? 'Confirm remove?' : 'Remove'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===================== CUSTOM ORDERS TAB ===================== */}
        {tab === 'orders' && (
          <div className="border border-salt-200 bg-white">
            <div className="border-b border-salt-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl tracking-tight">Custom Orders</h2>
                <p className="text-sm text-salt-500 mt-0.5">
                  {orders.length} order{orders.length !== 1 ? 's' : ''}
                  {search && ` (${filteredOrders.length} shown)`}
                </p>
              </div>
              <button
                onClick={() => fetchOrders(token)}
                disabled={loading}
                className="btn-secondary text-xs"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            <div className="border-b border-salt-200 px-6 py-3">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, type, or status..."
                className="input-field"
              />
            </div>

            {error ? (
              <div className="px-6 py-12 text-center text-sm text-red-600">{error}</div>
            ) : filteredOrders.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-salt-500">
                {search ? 'No orders match your search.' : 'No custom orders yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-salt-200 text-left text-xs uppercase tracking-wider text-salt-500">
                      <th className="px-6 py-3 font-medium">Customer</th>
                      <th className="px-6 py-3 font-medium hidden sm:table-cell">Type</th>
                      <th className="px-6 py-3 font-medium hidden md:table-cell">Date</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-salt-100 hover:bg-salt-50 transition-colors"
                      >
                        <td className="px-6 py-3">
                          <p className="font-medium text-salt-900">{order.name}</p>
                          <p className="text-xs text-salt-500">{order.email}</p>
                        </td>
                        <td className="px-6 py-3 text-salt-600 hidden sm:table-cell">
                          {order.project_type}
                          {(order.file_count ?? 0) > 0 && (
                            <span className="ml-2 text-xs text-salt-400">
                              {order.file_count} file{(order.file_count ?? 0) !== 1 ? 's' : ''}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-salt-500 hidden md:table-cell">{formatDate(order.created_at)}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status] || 'bg-salt-100 text-salt-700'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right space-x-3">
                          <button
                            onClick={() => fetchOrderDetail(token, order.id)}
                            className="text-xs font-medium text-accent hover:underline"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleRemoveOrder(order.id)}
                            onBlur={() => { if (confirmId === order.id) setConfirmId(null); }}
                            disabled={removing === order.id}
                            className={`text-xs font-medium transition-colors ${
                              confirmId === order.id
                                ? 'text-red-600 hover:text-red-700'
                                : 'text-salt-400 hover:text-red-600'
                            }`}
                          >
                            {removing === order.id ? 'Removing...' : confirmId === order.id ? 'Confirm?' : 'Remove'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===================== LISTINGS TAB ===================== */}
        {tab === 'listings' && (
          <div className="border border-salt-200 bg-white">
            <div className="border-b border-salt-200 px-6 py-4">
              <h2 className="font-display text-xl tracking-tight">Manage Listings</h2>
              <p className="text-sm text-salt-500 mt-0.5">
                Choose which Etsy listings appear on the 3D Prints and Laser Engraving pages.
              </p>
            </div>
            <AdminPanel token={token} />
          </div>
        )}
      </section>
    </>
  );
}
