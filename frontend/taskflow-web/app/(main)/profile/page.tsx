"use client";

import { useEffect, useState } from "react";
import { getProfile, changePassword } from "@/services/auth";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!oldPassword || !newPassword) {
      setError("Both passwords are required");
      return;
    }

    try {
      await changePassword(oldPassword, newPassword);
      setSuccess("Password changed successfully! Please login again.");
      setOldPassword("");
      setNewPassword("");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  const fullName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();

  return (
    <div className="container">
      <h2>My Profile</h2>

      <div className="card">
        <p>
          <b>Name:</b> <span>{fullName || "-"}</span>
        </p>
        <p>
          <b>Email:</b> <span>{profile?.email || "-"}</span>
        </p>
      </div>

      <hr />

      <h3>Change Password</h3>

      <div className="card">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleChangePassword}>
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <br /><br />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <br /><br />

          <button type="submit">Change Password</button>
        </form>
      </div>
    </div>
  );
}