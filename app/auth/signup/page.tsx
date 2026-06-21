"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Minimum 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/auth/signin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-12 text-center">
          <h1 className="text-2xl font-light tracking-wide text-stone-800 mb-2">
            La Couronne
          </h1>
          <p className="text-sm text-stone-500">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <div>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Full name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-0 py-3 bg-transparent border-b border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-800 transition-colors text-sm"
            />
          </div>

          <div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-0 py-3 bg-transparent border-b border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-800 transition-colors text-sm"
            />
          </div>

          <div>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-0 py-3 bg-transparent border-b border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-800 transition-colors text-sm"
            />
          </div>

          <div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              required
              minLength={8}
              value={formData.password}
              onChange={handleChange}
              className="w-full px-0 py-3 bg-transparent border-b border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-800 transition-colors text-sm"
            />
          </div>

          <div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-0 py-3 bg-transparent border-b border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-800 transition-colors text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-6 text-sm text-stone-800 border border-stone-800 hover:bg-stone-800 hover:text-white transition-all disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-stone-800 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}