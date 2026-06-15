"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Save, User, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setFullName(user?.user_metadata?.full_name || "");
      setAvatarUrl(user?.user_metadata?.avatar_url || "");
      setLoading(false);
    }

    loadUser();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        avatar_url: avatarUrl,
      },
    });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setUser(data.user);
    setMessage("Settings saved successfully.");
    setSaving(false);
  }

  if (loading) return null;

  return (
    <main className="page-wrap">
      <div className="container">
        <div className="header header-with-back">
          <div className="header-left">
            <button
              type="button"
              className="back-btn-inline"
              onClick={() => router.push("/")}
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1>Settings</h1>
              <p>Manage your account settings.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="card settings-simple-card modern-card">
          <div className="settings-profile-preview">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="settings-avatar" />
            ) : (
              <div className="settings-avatar-fallback">
                <User size={30} />
              </div>
            )}

            <div>
              <h2>{fullName || "Savvy User"}</h2>
              <p className="muted">{user?.email}</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="field-group">
              <label>Profile Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Avatar URL</label>
              <input
                type="url"
                placeholder="Paste image URL"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>

            <div className="profile-info-box">
              <Mail size={20} />
              <div>
                <span>Email</span>
                <strong>{user?.email}</strong>
              </div>
            </div>
          </div>

          {message && <p className="form-message success">{message}</p>}

          <button type="submit" className="primary-btn profile-save-btn" disabled={saving}>
            <Save size={18} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </main>
  );
}
