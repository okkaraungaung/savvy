"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Layers,
  Plus,
  User,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { notifyGroupMembershipChanged } from "@/lib/groupMembershipEvents";

export default function GroupsPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchGroups() {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("User not found.");
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("current_group_id")
        .eq("id", user.id)
        .maybeSingle();

      setCurrentGroupId(profile?.current_group_id || null);

      const { data: memberships, error: memberError } = await supabase
        .from("group_members")
        .select("role, groups(id, name, type, invite_code, created_at)")
        .eq("user_id", user.id);

      if (memberError) {
        setError(memberError.message);
        setLoading(false);
        return;
      }

      const groupList =
        memberships
          ?.map((item) => ({
            ...item.groups,
            role: item.role,
          }))
          .filter((group) => group.id)
          .sort(
            (a, b) =>
              new Date(b.created_at || 0).getTime() -
              new Date(a.created_at || 0).getTime()
          ) || [];

      setGroups(groupList);
      setLoading(false);
    }

    fetchGroups();
  }, [supabase]);

  async function handleSelect(groupId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("profiles").upsert([
      {
        id: user.id,
        current_group_id: groupId,
      },
    ]);

    notifyGroupMembershipChanged();
    setCurrentGroupId(groupId);
    router.refresh();
  }

  if (loading) return <div className="loading">Loading workspaces...</div>;

  return (
    <main className="page-wrap">
      <div className="container">
        <div className="workspace-page-head">
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
              <p className="workspace-kicker">Workspaces</p>
              <h1>Choose where Savvy saves today</h1>
              <p>
                Switch between personal tracking and shared group spaces without
                losing your place.
              </p>
            </div>
          </div>

          <div className="workspace-head-actions">
            <Link href="/groups/create" className="workspace-action primary">
              <Plus size={17} />
              Create
            </Link>
            <Link href="/groups/join" className="workspace-action">
              <Users size={17} />
              Join
            </Link>
          </div>
        </div>

        {error ? (
          <div className="workspace-message">
            <p>Error: {error}</p>
          </div>
        ) : null}

        <div className="workspace-grid">
          <button
            type="button"
            className={`workspace-card ${currentGroupId ? "" : "active"}`}
            onClick={() => handleSelect(null)}
          >
            <div className="workspace-card-top">
              <span className="workspace-icon personal">
                <User size={22} />
              </span>
              {!currentGroupId && (
                <span className="workspace-badge">
                  <Check size={14} />
                  Active
                </span>
              )}
            </div>

            <h2>Personal</h2>
            <p>Your private assets, goals, and transactions.</p>

            <span className="workspace-card-footer">
              Use personal workspace
              <ArrowRight size={16} />
            </span>
          </button>

          {groups.map((group) => {
            const isActive = currentGroupId === group.id;

            return (
              <button
                type="button"
                key={group.id}
                className={`workspace-card ${isActive ? "active" : ""}`}
                onClick={() => handleSelect(group.id)}
              >
                <div className="workspace-card-top">
                  <span className="workspace-icon group">
                    <Layers size={22} />
                  </span>
                  {isActive ? (
                    <span className="workspace-badge">
                      <Check size={14} />
                      Active
                    </span>
                  ) : (
                    <span className="workspace-role">
                      {group.role || "member"}
                    </span>
                  )}
                </div>

                <h2>{group.name}</h2>
                <p>{group.type || "Shared group workspace"}</p>

                {group.invite_code && (
                  <span className="workspace-code">
                    <Copy size={14} />
                    {group.invite_code}
                  </span>
                )}

                <span className="workspace-card-footer">
                  Switch workspace
                  <ArrowRight size={16} />
                </span>
              </button>
            );
          })}

          {groups.length === 0 && (
            <div className="workspace-empty modern-card">
              <Users size={26} />
              <h2>No group workspaces yet</h2>
              <p>Create a group or join one with an invite code.</p>
              <div className="workspace-empty-actions">
                <Link href="/groups/create" className="workspace-action primary">
                  Create group
                </Link>
                <Link href="/groups/join" className="workspace-action">
                  Join group
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
