"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateInviteCode } from "@/lib/groupCode";
import { notifyGroupMembershipChanged } from "@/lib/groupMembershipEvents";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const groupTypes = ["couple", "family", "friends"];

export default function CreateGroupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [type, setType] = useState("family");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function createUniqueCode() {
    let code = "";
    let exists = true;

    while (exists) {
      code = generateInviteCode();

      const { data, error } = await supabase
        .from("groups")
        .select("id")
        .eq("invite_code", code)
        .maybeSingle();

      if (error) {
        throw error;
      }

      exists = !!data;
    }

    return code;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setInviteCode("");
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("User not found.");
      setLoading(false);
      return;
    }

    try {
      const code = await createUniqueCode();

      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .insert([
          {
            name: name.trim(),
            type,
            invite_code: code,
            owner_id: user.id,
          },
        ])
        .select()
        .single();

      if (groupError) {
        setError(groupError.message);
        setLoading(false);
        return;
      }

      const { error: memberError } = await supabase
        .from("group_members")
        .insert([
          {
            group_id: groupData.id,
            user_id: user.id,
            role: "owner",
          },
        ]);

      if (memberError) {
        setError(memberError.message);
        setLoading(false);
        return;
      }

      notifyGroupMembershipChanged();

      setSuccess("Group created successfully.");
      setInviteCode(code);
      setName("");
      setType("family");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }

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
              <h1>Create Group</h1>
              <p>Create a savings group and share the code with others.</p>
            </div>
          </div>
        </div>

        <div className="page-section">
          <form onSubmit={handleSubmit} className="card form-card">
            <h2>New Group</h2>

            <div className="form-grid">
              <input
                type="text"
                placeholder="Group name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <select value={type} onChange={(e) => setType(e.target.value)}>
                {groupTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Group"}
            </button>

            {error ? <p className="muted">Error: {error}</p> : null}
            {success ? <p className="muted">{success}</p> : null}
            {inviteCode ? (
              <p className="muted">
                Invite code: <strong>{inviteCode}</strong>
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </main>
  );
}
