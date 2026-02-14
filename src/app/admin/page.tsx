import type { Metadata } from 'next';
import { AdminPanel } from '@/components/AdminPanel';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="container-site py-10">
      <h1 className="section-heading">Admin</h1>
      <p className="section-subheading mb-8">
        Manage which listings appear on the 3D Prints and Laser Engraving pages.
      </p>
      <AdminPanel />
    </div>
  );
}
