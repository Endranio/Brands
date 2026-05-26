'use client';

import { useSignIn } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signInSchema } from '@/validations/schemas';
import type { SignInFormValues } from '@/validations/schemas';

export function SignInForm() {
  const { signIn } = useSignIn();
  const router = useRouter();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: SignInFormValues) {
    if (!signIn) {
      return;
    }

    setError('');

    try {
      // Step 1: Create sign-in attempt with identifier
      const createResult = await signIn.create({ identifier: data.email });
      if (createResult.error) {
        setError('Email tidak ditemukan.');
        return;
      }

      // Step 2: Submit password
      const passwordResult = await signIn.password({ password: data.password });
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
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-[400px] flex-col gap-[24px] bg-canvas p-[40px]"
      style={{ border: '1px solid var(--color-hairline-soft)' }}
    >
      <h2 className="text-heading-lg text-center text-ink">Login Admin</h2>

      {error && (
        <div
          className="bg-[#fef2f2] p-[12px] text-[14px] text-sale"
          style={{ borderLeft: '3px solid var(--color-sale)' }}
        >
          {error}
        </div>
      )}

      {errors && Object.keys(errors).length > 0 && (
        <div
          className="bg-[#fef2f2] p-[12px] text-[14px] text-sale"
          style={{ borderLeft: '3px solid var(--color-sale)' }}
        >
          {Object.values(errors).map((err) => (
            <p key={err?.message}>{err?.message?.toString()}</p>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-[6px]">
        <label htmlFor="email" className="text-caption-md text-ink">
          Email <span className="text-sale">*</span>
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          placeholder="admin@email.com"
          disabled={isSubmitting}
          className="h-[48px] w-full bg-soft-cloud px-[16px] text-[15px] text-ink transition-all outline-none placeholder:text-stone focus:ring-2 focus:ring-ink"
        />
      </div>

      <div className="flex flex-col gap-[6px]">
        <label htmlFor="password" className="text-caption-md text-ink">
          Password <span className="text-sale">*</span>
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          placeholder="••••••••"
          disabled={isSubmitting}
          className="h-[48px] w-full bg-soft-cloud px-[16px] text-[15px] text-ink transition-all outline-none placeholder:text-stone focus:ring-2 focus:ring-ink"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="button-primary mt-[8px] flex w-full items-center justify-center gap-2 disabled:opacity-50"
      >
        {isSubmitting && (
          <svg
            className="h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {isSubmitting ? 'Memproses...' : 'Masuk'}
      </button>
    </form>
  );
}
