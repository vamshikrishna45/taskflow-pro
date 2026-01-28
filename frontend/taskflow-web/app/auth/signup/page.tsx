"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/services/auth";

export default function SignupPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName || !email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      await signup({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });

      alert("Signup successful. Please login.");
      router.push("/auth/login");
    } catch (err: any) {
      setError(err.message || "Signup failed");
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
            Join thousands of teams managing their tasks efficiently.
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

      {/* RIGHT SIGNUP PANEL */}
      <section className="login-panel">
        <div className="login-form-wrapper">
          <div className="login-header">
            <h2>Create your account</h2>
            <p className="subtitle">Get started with TaskFlowPro</p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="login-form">
            <div className="form-group">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
              />
            </div>

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
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
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
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => router.push("/auth/login")}
            disabled={loading}
          >
            Already have an account? Log in
          </button>
        </div>
      </section>
    </div>
  );
}