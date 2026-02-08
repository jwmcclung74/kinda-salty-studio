import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-site py-20 text-center">
      <h1 className="text-6xl font-display text-salt-300">404</h1>
      <p className="mt-4 text-xl text-salt-600">Page not found</p>
      <p className="mt-2 text-salt-400">The page you&apos;re looking for doesn&apos;t exist.</p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/" className="btn-primary">Go Home</Link>
        <Link href="/shop" className="btn-secondary">Browse Shop</Link>
      </div>
    </div>
  );
}
