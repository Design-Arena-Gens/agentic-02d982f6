import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cricket 26 2D - Simulation',
  description: 'Top-down 2D cricket simulation with fixtures, standings, records, stats, lineups, editor, settings.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="app-header">
            <h1>Cricket 26 2D</h1>
            <span className="subtitle">Simulation</span>
          </header>
          <main className="app-main">{children}</main>
          <footer className="app-footer">? {new Date().getFullYear()} Cricket 26 2D</footer>
        </div>
      </body>
    </html>
  );
}
