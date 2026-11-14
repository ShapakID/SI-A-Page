import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-hairline bg-canvas sticky top-0 z-30">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-semibold text-base text-ink tracking-tight">SI-A</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-ink-muted border border-hairline font-mono">
              2024
            </span>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/admin"
            className="inline-flex items-center space-x-1.5 text-xs text-ink-muted hover:text-ink px-2.5 py-1.5 rounded-md hover:bg-neutral-100 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
