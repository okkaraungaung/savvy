"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ScopeSwitcher() {
  const supabase = createClient();

  const [groups, setGroups] = useState([]);
  const [selectedValue, setSelectedValue] = useState("personal");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadScope() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: memberships } = await supabase
        .from("group_members")
        .select("group_id, groups(id, name)")
        .eq("user_id", user.id);

      const groupList =
        memberships?.map((item) => item.groups).filter(Boolean) || [];

      setGroups(groupList);

      const { data: profile } = await supabase
        .from("profiles")
        .select("current_group_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.current_group_id) {
        setSelectedValue(profile.current_group_id);
      } else {
        setSelectedValue("personal");
      }

      setLoading(false);
    }

    loadScope();
  }, []);

  async function handleChange(e) {
    const value = e.target.value;
    setSelectedValue(value);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const groupId = value === "personal" ? null : value;

    await supabase.from("profiles").upsert([
      {
        id: user.id,
        current_group_id: groupId,
      },
    ]);

    window.location.reload();
  }

  if (loading) return null;

  return (
    <select
      value={selectedValue}
      onChange={handleChange}
      className="scope-select"
    >
      <option value="personal">Personal</option>

      {groups.map((group) => (
        <option key={group.id} value={group.id}>
          {group.name}
        </option>
      ))}
    </select>
  );
}
