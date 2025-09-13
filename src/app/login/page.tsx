export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <p className="text-gray-600">
        We’ll send you a one-time link to your email.
      </p>
      <form action="/api/auth/magic-link" method="post" className="card space-y-3">
        <div>
          <label className="label">Email</label>
          <input className="input" name="email" type="email" required />
        </div>
        <button className="btn btn-primary" type="submit">Send login link</button>
      </form>
    </div>
  );
}
