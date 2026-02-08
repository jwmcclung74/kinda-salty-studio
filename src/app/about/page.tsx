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
          <p>Kinda Salty Studio started with a 3D printer, a laser cutter, and a refusal to settle for boring. What began as a hobby quickly turned into a passion for creating things that are functional, beautiful, and a little bit unexpected.</p>
          <p>Every product in our shop is designed, printed or engraved, and finished by hand. We work with PLA, resin, wood, and acrylic — choosing the right material for each design to ensure quality and durability.</p>
          <p>Whether it&apos;s a detailed miniature for your tabletop game, a personalized sign for your home, or a custom gift that says &ldquo;I actually put thought into this,&rdquo; we make things that people are proud to own and give.</p>
          <h2 className="text-2xl font-display text-salt-900 pt-4">What We Do</h2>
          <p><strong className="text-salt-900">3D Printing:</strong> We use FDM and resin printers to create everything from articulated toys to functional home goods.</p>
          <p><strong className="text-salt-900">Laser Engraving &amp; Cutting:</strong> Precision laser work on wood, acrylic, and other materials.</p>
          <p><strong className="text-salt-900">Custom Orders:</strong> Have something specific in mind? <Link href="/custom-orders" className="text-accent hover:underline">Tell us what you&apos;re thinking</Link> and we&apos;ll figure it out together.</p>
        </div>
        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/shop" className="btn-primary">Browse the Shop</Link>
          <Link href="/custom-orders" className="btn-secondary">Request a Custom Order</Link>
        </div>
      </div>
    </div>
  );
}
