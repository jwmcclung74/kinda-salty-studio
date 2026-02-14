import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/site.config';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Kinda Salty Studio — a small-batch maker studio specializing in 3D prints and laser engravings.',
  alternates: { canonical: `${siteConfig.url}/about` },
};

export default function AboutPage() {
  return (
    <div className="container-site py-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">About</p>
        <h1 className="section-heading">The Story Behind the Salt</h1>
        <div className="mt-8 space-y-6 text-salt-700 leading-relaxed">
          <p>Kinda Salty Studio is a husband and wife maker duo who love turning ideas into real, usable things.</p>
          <p>We design and build practical products using 3D modeling and printing which means we&apos;re not limited by what&apos;s sitting on a store shelf. If it can be designed, it can be made. From clever problem solvers to accessories that fit your life (or your vehicle) perfectly, creativity is the only real constraint.</p>
          <p>On the jewelry side, we can absolutely do classic and simple. But we also like to have a little fun with it. If you want something with personality, something a little less &ldquo;ordinary&rdquo; and a little more salty, that&apos;s where we really shine.</p>
          <p>Have an idea? Send it. We love collaborating and creating custom pieces that are personal, meaningful, and made just for you.</p>
        </div>
        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/shop" className="btn-primary">Browse the Shop</Link>
          <Link href="/custom-orders" className="btn-secondary">Request a Custom Order</Link>
        </div>
      </div>
    </div>
  );
}
