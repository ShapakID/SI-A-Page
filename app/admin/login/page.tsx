'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, AlertCircle, Terminal, Mail } from 'lucide-react';

function LoginForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const [devEmail, setDevEmail] = useState('');
  const [loadingDev, setLoadingDev] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const getErrorMessage = (error: string | null) => {
    if (!error) return null;
    switch (error) {
      case 'AccessDenied':
        return 'Email Anda tidak terdaftar di whitelist ADMIN_EMAILS. Akses ditolak.';
      case 'CredentialsSignin':
        return 'Email ini tidak terdaftar dalam whitelist admin.';
      case 'config':
      case 'Configuration':
        return 'Konfigurasi NextAuth/OAuth belum lengkap di .env.local.';
      case 'OAuthSignin':
      case 'OAuthCallback':
        return 'Gagal memproses login Google OAuth. Periksa Client ID, Secret, atau Authorized Redirect URI.';
      default:
        return `Terjadi kesalahan autentikasi: ${error}`;
    }
  };

  const errorMessage = getErrorMessage(errorParam);

  const handleDevLogin = async (emailToUse?: string) => {
    const target = (emailToUse || devEmail).trim();
    if (!target) return;
    setLoadingDev(true);
    await signIn('dev-login', { email: target, callbackUrl: '/admin' });
    setLoadingDev(false);
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    await signIn('google', { callbackUrl: '/admin' });
  };

  const quickEmails = [
    'shapakid@gmail.com',
    'zalfafya@gmail.com',
    'awaasalwa07@gmail.com',
  ];

  return (
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
            Khusus pengurus kelas (PJ / Komti). Login menggunakan akun terdaftar di whitelist.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Google OAuth Login */}
        <div className="space-y-2">
          <button
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
            className="w-full py-2.5 px-4 bg-ink text-canvas hover:bg-neutral-800 disabled:opacity-50 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
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
            <span>{loadingGoogle ? 'Menghubungkan...' : 'Masuk dengan Google'}</span>
          </button>
        </div>

        {/* Separator */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-hairline w-full" />
          <span className="bg-canvas px-2 text-[10px] uppercase font-mono tracking-wider text-ink-muted shrink-0">
            atau mode lokal / testing
          </span>
        </div>

        {/* Local / Dev Mode Login */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-ink flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-ink-muted" />
              <span>Email Admin Terdaftar</span>
            </label>
            <input
              type="email"
              value={devEmail}
              onChange={(e) => setDevEmail(e.target.value)}
              placeholder="shapakid@gmail.com"
              className="w-full text-xs px-3 py-2 border border-hairline rounded-lg bg-canvas text-ink focus:outline-none focus:ring-1 focus:ring-neutral-400 font-mono"
            />
          </div>

          <button
            onClick={() => handleDevLogin()}
            disabled={loadingDev || !devEmail.trim()}
            className="w-full py-2 px-3 border border-hairline rounded-lg text-xs font-medium text-ink hover:bg-neutral-100 disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{loadingDev ? 'Memproses...' : 'Masuk (Bypass Dev Mode)'}</span>
          </button>

          {/* Quick Select Buttons */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] text-ink-muted block">Pilih cepat email whitelist:</span>
            <div className="flex flex-col gap-1">
              {quickEmails.map((email) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => {
                    setDevEmail(email);
                    handleDevLogin(email);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-[11px] font-mono border border-hairline rounded hover:bg-neutral-100 text-ink transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{email}</span>
                  <span className="text-[10px] text-ink-muted shrink-0">Klik untuk masuk &rarr;</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-hairline text-center">
          <span className="text-[11px] text-ink-muted">
            Whitelist aktif: <code className="font-mono text-ink">3 Admin</code>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-canvas-subtle flex flex-col justify-center items-center px-4">
      <Suspense
        fallback={
          <div className="text-xs text-ink-muted animate-pulse">
            Memuat formulir login...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
