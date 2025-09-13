'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setMessage("");

    const res = await fetch('/api/auth/magic-link', {
      method: 'POST',
      body: new FormData(e.currentTarget),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      setStatus('error');
      setMessage('Could not send login link.');
      return;
    }

    // Hvis der ikke er sat mail op, følger vi linket automatisk
    if (data.sent === false && data.link) {
      window.location.href = data.link;
      return;
    }

    setStatus('sent');
    setMessage('Check your inbox for the login link.');
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <p className="text-gray-600">We’ll send you a one-time link to your email.</p>

      <form onSubmit={onSubmit} className="card space-y-3">
        <div>
          <label className="label">Email</label>
          <input className="input" name="email" type="email" required />
        </div>

        <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send login link'}
        </button>

        {message && <div className="text-sm text-gray-700">{message}</div>}
      </form>
    </div>
  );
}
