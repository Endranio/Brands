'use client';

import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignInForm() {
  const { signIn } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!signIn) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Create sign-in attempt with identifier
      const createResult = await signIn.create({ identifier: email });
      if (createResult.error) {
        setError('Email tidak ditemukan.');
        return;
      }

      // Step 2: Submit password
      const passwordResult = await signIn.password({ password });
      if (passwordResult.error) {
        setError('Password salah.');
        return;
      }

      // Step 3: Finalize — activate the session
      const finalizeResult = await signIn.finalize();
      if (finalizeResult.error) {
        setError('Gagal memproses login.');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Email atau password salah.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-[400px] flex-col gap-[24px] bg-canvas p-[40px]"
      style={{ border: '1px solid var(--color-hairline-soft)' }}
    >
      <h2 className="text-heading-lg text-center text-ink">Login Admin</h2>

      {error && <div className="bg-[#fef2f2] p-[12px] text-[14px] text-sale">{error}</div>}

      <div className="flex flex-col gap-[6px]">
        <label htmlFor="email" className="text-caption-md text-ink">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          placeholder="admin@email.com"
          required
          className="h-[48px] w-full bg-soft-cloud px-[16px] text-[15px] text-ink outline-none placeholder:text-stone focus:ring-2 focus:ring-ink"
        />
      </div>

      <div className="flex flex-col gap-[6px]">
        <label htmlFor="password" className="text-caption-md text-ink">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          placeholder="••••••••"
          required
          className="h-[48px] w-full bg-soft-cloud px-[16px] text-[15px] text-ink outline-none placeholder:text-stone focus:ring-2 focus:ring-ink"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="button-primary mt-[8px] w-full disabled:opacity-50"
      >
        {loading ? 'Memproses...' : 'Masuk'}
      </button>
    </form>
  );
}
