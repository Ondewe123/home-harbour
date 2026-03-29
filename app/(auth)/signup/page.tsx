'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [householdName, setHouseholdName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned');

      // Create household
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .insert([
          {
            name: householdName,
            created_by: authData.user.id,
          },
        ])
        .select()
        .single();

      if (householdError) throw householdError;

      // Create user record
      const { error: userError } = await supabase.from('users').insert([
        {
          auth_id: authData.user.id,
          email,
          display_name: displayName,
          household_id: householdData.id,
          role: 'admin',
        },
      ]);

      if (userError) throw userError;

      router.push('/pantry');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Home Harbour</h1>
        <p className="mt-2 text-sm text-gray-600">Set up your household pantry management</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="household" className="block text-sm font-medium text-gray-700">
            Household Name
          </label>
          <input
            id="household"
            type="text"
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
            placeholder="e.g., Smith Family"
            required
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
            Your Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g., John Smith"
            required
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary-600 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
