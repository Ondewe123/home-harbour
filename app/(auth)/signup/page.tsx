'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client'; // used for signInWithPassword after signup

export default function SignupPage() {
  const [form, setForm] = useState({ householdName: '', displayName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          displayName: form.displayName,
          householdName: form.householdName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign up failed');

      // Sign in immediately after account creation
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (signInError) throw signInError;

      router.push('/pantry');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: 'householdName', label: 'Household Name', placeholder: 'e.g. The Smith Home', type: 'text', autoComplete: 'organization' },
    { id: 'displayName', label: 'Your Name', placeholder: 'e.g. John Smith', type: 'text', autoComplete: 'name' },
    { id: 'email', label: 'Email Address', placeholder: 'you@example.com', type: 'email', autoComplete: 'email' },
    { id: 'password', label: 'Password', placeholder: '••••••••', type: 'password', autoComplete: 'new-password' },
  ] as const;

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          <svg className="w-7 h-7 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="font-heading text-lg font-semibold text-harbour-text">Home Harbour</span>
        </div>
        <h1 className="font-heading text-2xl font-semibold text-harbour-text">Create your household</h1>
        <p className="mt-1.5 text-sm text-harbour-muted">Set up Home Harbour for your family</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {fields.map(({ id, label, placeholder, type, autoComplete }) => (
          <div key={id} className="space-y-1.5">
            <label htmlFor={id} className="block text-sm font-medium text-harbour-text-dim">{label}</label>
            <input
              id={id}
              type={type}
              value={form[id]}
              onChange={update(id)}
              placeholder={placeholder}
              required
              autoComplete={autoComplete}
              className="input-field"
            />
          </div>
        ))}

        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-harbour-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand-400 hover:text-brand-300 transition-colors duration-200">
          Sign in
        </Link>
      </p>
    </div>
  );
}
