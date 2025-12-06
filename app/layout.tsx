import './globals.css';
import { Providers } from './providers'; // Import the new Providers component
import type { ReactNode } from 'react'; // Import ReactNode

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers> {/* Wrap children with Providers */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
