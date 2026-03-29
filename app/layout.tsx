import type { Metadata } from 'next';
import { AuthProvider } from '@/context/auth-context';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Home Harbour',
  description: 'Manage your household pantry with ease',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
