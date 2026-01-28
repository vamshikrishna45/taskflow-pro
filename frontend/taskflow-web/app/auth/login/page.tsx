"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      {/* LEFT BRAND SECTION */}
      <section className="login-brand">
        <div className="brand-content">
          <div className="brand-logo">
            <img
              src="/images/TaskFlowPro.png"
              alt="TaskFlowPro"
              className="brand-image"
            />
          </div>

          <h1 className="brand-title">TaskFlowPro</h1>

          <p className="brand-tagline">
            Plan smarter. Execute faster. Stay in control.
          </p>

          <p className="brand-subtext">
            A real-time task management platform built for modern teams.
          </p>

          <div className="brand-features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Real-time collaboration</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>AI-powered insights</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Seamless task tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT LOGIN PANEL */}
      <section className="login-panel">
        <div className="login-form-wrapper">
          <div className="login-header">
            <h2>Welcome back</h2>
            <p className="subtitle">Log in to your account to continue</p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => router.push("/auth/signup")}
            disabled={loading}
          >
            Create new account
          </button>

          <div className="login-footer">
            <button
              type="button"
              className="btn-link"
              onClick={() => router.push("/auth/forgot-password")}
              disabled={loading}
            >
              Forgot your password?
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}