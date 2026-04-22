"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function GroupsPage() {
  const supabase = createClient();
  const [groups, setGroups] = useState([]);
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

      const { data: memberships, error: memberError } = await supabase
        .from("group_members")
        .select("group_id, role")
        .eq("user_id", user.id);

      if (memberError) {
        setError(memberError.message);
        setLoading(false);
        return;
      }

      if (!memberships || memberships.length === 0) {
        setGroups([]);
        setLoading(false);
        return;
      }

      const groupIds = memberships.map((item) => item.group_id);

      const { data: groupsData, error: groupsError } = await supabase
        .from("groups")
        .select("*")
        .in("id", groupIds)
        .order("created_at", { ascending: false });

      if (groupsError) {
        setError(groupsError.message);
        setLoading(false);
        return;
      }

      setGroups(groupsData || []);
      setLoading(false);
    }

    fetchGroups();
  }, []);

  if (loading) return <div className="loading">Loading groups...</div>;

  return (
    <main className="page-wrap">
      <div className="container">
        <div className="header">
          <div>
            <h1>My Groups</h1>
            <p>Groups you created or joined.</p>
          </div>
        </div>

        {error ? (
          <div className="card">
            <p className="muted">Error: {error}</p>
          </div>
        ) : null}

        <div className="goal-grid">
          {groups.length === 0 ? (
            <div className="card">
              <p className="muted">No groups yet.</p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.id} className="card">
                <h3>{group.name}</h3>
                <p className="muted">Type: {group.type}</p>
                <p className="muted">Code: {group.invite_code}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
