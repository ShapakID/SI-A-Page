import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

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
