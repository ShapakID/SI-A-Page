'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-canvas-subtle flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="bg-canvas border border-hairline rounded-xl p-6 shadow-subtle space-y-6">
          <div className="space-y-1">
            <div className="inline-flex p-2 rounded-lg bg-neutral-100 border border-hairline mb-2">
              <ShieldCheck className="w-5 h-5 text-ink" />
            </div>
            <h1 className="text-lg font-semibold text-ink">Admin Portal SI-A</h1>
            <p className="text-xs text-ink-muted">
              Khusus pengurus kelas (PJ / Komti). Login menggunakan akun Google terdaftar di whitelist.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => signIn('google', { callbackUrl: '/admin' })}
              className="w-full py-2.5 px-4 bg-ink text-canvas hover:bg-neutral-800 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Masuk dengan Google</span>
            </button>
          </div>

          <div className="pt-2 border-t border-hairline text-center">
            <span className="text-[11px] text-ink-muted">
              Akses dibatasi via whitelist <code className="font-mono text-ink">ADMIN_EMAILS</code>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
