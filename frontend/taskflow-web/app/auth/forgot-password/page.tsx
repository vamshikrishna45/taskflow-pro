"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/services/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
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
            Secure access. Zero friction.
          </p>

          <p className="brand-subtext">
            Enter your registered email and we'll help you regain access to your account.
          </p>

          <div className="brand-features">
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span>Secure password reset</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Instant email delivery</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Easy account recovery</span>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT FORGOT PASSWORD PANEL */}
      <section className="login-panel">
        <div className="login-form-wrapper">
          <div className="login-header">
            <h2>Reset your password</h2>
            <p className="subtitle">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠</span>
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              <span className="success-icon">✓</span>
              If the account exists, a reset link has been sent to your email.
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || success}
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Sending reset link...
                </>
              ) : success ? (
                "Reset link sent"
              ) : (
                "Send reset link"
              )}
            </button>
          </form>

          <div className="login-footer">
            <button
              type="button"
              className="btn-link"
              onClick={() => router.push("/auth/login")}
              disabled={loading}
            >
              ← Back to login
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}