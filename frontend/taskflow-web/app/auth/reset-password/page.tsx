"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/services/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token");
  }, [token]);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token!, newPassword);
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Password reset failed");
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
            Secure access. One last step.
          </p>

          <p className="brand-subtext">
            Create a new password to regain access to your account.
          </p>

          <div className="brand-features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Secure authentication</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Encrypted data protection</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Quick account recovery</span>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT LOGIN PANEL */}
      <section className="login-panel">
        <div className="login-form-wrapper">
          <div className="login-header">
            <h2>Reset password</h2>
            <p className="subtitle">Choose a strong new password</p>
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
              {success}
            </div>
          )}

          <form onSubmit={handleReset} className="login-form">
            <div className="form-group">
              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                placeholder="Enter new password (min 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading || !token}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || !token}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !token}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Resetting...
                </>
              ) : (
                "Reset password"
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