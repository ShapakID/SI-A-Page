import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { getAcademicYear } from '../lib/ui-helpers';

export function Header() {
  const academicYear = getAcademicYear(new Date());

  return (
    <header className="border-b border-hairline bg-canvas sticky top-0 z-30">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-baseline space-x-2">
          <span className="font-semibold text-base text-ink tracking-tight">SI-A</span>
          <span className="text-[11px] text-ink-muted tabular-nums">{academicYear}</span>
        </Link>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Link
            href="/admin"
            className="inline-flex items-center space-x-1.5 text-xs font-medium text-ink border border-hairline px-2.5 py-1.5 rounded-md hover:bg-canvas-subtle transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
