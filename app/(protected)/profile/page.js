"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, ArrowLeft, Save, Image } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
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

      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, email")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      if (profile) {
        setFullName(profile.full_name || "");
        setAvatarUrl(profile.avatar_url || "");
      } else {
        await supabase.from("profiles").insert([
          {
            id: user.id,
            email: user.email,
            full_name: "",
            avatar_url: "",
          },
        ]);
      }

      setLoading(false);
    }

    loadUser();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    if (!user) {
      setMessage("User not found.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setMessage("Profile updated successfully.");
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
              <h1>Profile</h1>
              <p>Manage your personal account information.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="card profile-card modern-card">
          <div className="profile-page-header">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="User avatar"
                className="profile-page-avatar"
              />
            ) : (
              <div className="profile-page-avatar-fallback">
                <User size={34} />
              </div>
            )}

            <div>
              <h2>{fullName || "Savvy User"}</h2>
              <p className="muted">{user?.email}</p>
            </div>
          </div>

          <div className="profile-form-grid">
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
              <label>Avatar Image URL</label>
              <div className="profile-input-icon-box">
                <Image size={18} />
                <input
                  type="url"
                  placeholder="Paste image URL"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>
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

          <button
            type="submit"
            className="primary-btn profile-save-btn"
            disabled={saving}
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}
