"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        // Redirect to home on successful sign in
        window.location.href = "/";
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-crown-cream px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="font-display text-4xl font-semibold text-crown-ink">
            Welcome to La Couronne
          </h1>
          <p className="text-crown-espresso/90">
            Sign in to experience personalized service
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-crown-espresso">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              className="block w-full rounded-md border border-crown-espresso/20 bg-white px-3 py-2 text-base text-crown-espresso placeholder-crown-espresso/40 focus:outline-none focus:border-crown-espresso focus:ring-2 focus:ring-crown-espresso"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-crown-espresso">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="block w-full rounded-md border border-crown-espresso/20 bg-white px-3 py-2 text-base text-crown-espresso placeholder-crown-espresso/40 focus:outline-none focus:border-crown-espresso focus:ring-2 focus:ring-crown-espresso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-crown-espresso px-4 py-2 text-sm font-medium text-crown-paper hover:bg-crown-caramel transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                  <path d="M12 6v6m4-4h6" strokeLinecap="round" />
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 2l8.49 7.55a1 1 0 01-.5 1.7l-3.89 3.76a1 1 0 01-1.5 0L12 9.09l-4.6 4.5a1 1 0 01-1.5 0l-3.89-3.76a1 1 0 01-.5-1.7l8.49-7.55z" />
                </svg>
                <span>Sign in</span>
              </>
            )}
          </button>

          <div className="text-center text-sm text-crown-espresso/80">
            <p>
              Don&apos;t have an account? <span className="text-crown-espresso underline hover:text-crown-ink">Contact us to register</span>
            </p>
            <p className="mt-2">
              For demo purposes, use any email with any password to sign in
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}