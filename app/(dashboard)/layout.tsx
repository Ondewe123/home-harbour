import { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import Navbar from '@/components/navbar';
import Sidebar from '@/components/sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
