"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { notifyGroupMembershipChanged } from "@/lib/groupMembershipEvents";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function JoinGroupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const normalizedCode = code.trim().toUpperCase();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("User not found.");
      setLoading(false);
      return;
    }

    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("*")
      .eq("invite_code", normalizedCode)
      .maybeSingle();

    if (groupError) {
      setError(groupError.message);
      setLoading(false);
      return;
    }

    if (!group) {
      setError("Invalid invite code.");
      setLoading(false);
      return;
    }

    const { data: existingMembership, error: existingError } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", group.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) {
      setError(existingError.message);
      setLoading(false);
      return;
    }

    if (existingMembership) {
      setError("You already joined this group.");
      setLoading(false);
      return;
    }

    const { error: joinError } = await supabase.from("group_members").insert([
      {
        group_id: group.id,
        user_id: user.id,
        role: "member",
      },
    ]);

    if (joinError) {
      setError(joinError.message);
      setLoading(false);
      return;
    }

    notifyGroupMembershipChanged();

    setSuccess(`Joined "${group.name}" successfully.`);
    setCode("");
    setLoading(false);
  }

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
              <h1>Join Group</h1>
              <p>Enter a 6-character code to join a savings group.</p>
            </div>
          </div>
        </div>

        <div className="page-section">
          <form onSubmit={handleSubmit} className="card form-card">
            <h2>Enter Invite Code</h2>

            <div className="form-grid">
              <input
                type="text"
                placeholder="Example: A1B2C3"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                required
              />
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Joining..." : "Join Group"}
            </button>

            {error ? <p className="muted">Error: {error}</p> : null}
            {success ? <p className="muted">{success}</p> : null}
          </form>
        </div>
      </div>
    </main>
  );
}
