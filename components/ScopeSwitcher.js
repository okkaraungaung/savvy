"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChevronDown, Check, Layers, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ScopeSwitcher() {
  const supabase = createClient();
  const router = useRouter();

  const [groups, setGroups] = useState([]);
  const [selectedValue, setSelectedValue] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef(null);

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
  }, [supabase]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleSelect(value) {
    setSelectedValue(value);
    setOpen(false);

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

  const selectedGroup = groups.find((group) => group.id === selectedValue);

  const selectedLabel =
    selectedValue === "personal"
      ? "Personal"
      : selectedGroup?.name || "Select scope";

  if (loading) return null;

  return (
    <div
      className={`scope-switcher compact ${open ? "open" : ""}`}
      ref={wrapperRef}
    >
      {/* TRIGGER */}
      <button
        type="button"
        className="scope-trigger"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="scope-trigger-left">
          <div className="scope-trigger-icon">
            {selectedValue === "personal" ? (
              <User size={16} />
            ) : (
              <Layers size={16} />
            )}
          </div>

          <div className="scope-trigger-text">
            <span className="scope-trigger-label">Current scope</span>
            <span className="scope-trigger-value">{selectedLabel}</span>
          </div>
        </div>

        <ChevronDown size={18} className="scope-chevron" />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="scope-menu">
          {/* PERSONAL */}
          <div className="scope-menu-group">
            <p className="scope-menu-title">Personal</p>

            <button
              type="button"
              className={`scope-option ${
                selectedValue === "personal" ? "active" : ""
              }`}
              onClick={() => handleSelect("personal")}
            >
              <div className="scope-option-left">
                <div className="scope-option-icon">
                  <User size={16} />
                </div>
                <span>Personal</span>
              </div>

              {selectedValue === "personal" && <Check size={16} />}
            </button>
          </div>

          {/* GROUPS */}
          {groups.length > 0 && (
            <>
              <div className="scope-divider" />

              <div className="scope-menu-group">
                <div className="scope-menu-header">
                  <p className="scope-menu-title">Groups</p>
                  <button
                    type="button"
                    className="scope-menu-toggle"
                    onClick={() => {
                      setOpen(false);
                      router.push("/groups");
                    }}
                  >
                    Show Groups
                  </button>
                </div>

                {groups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    className={`scope-option ${
                      selectedValue === group.id ? "active" : ""
                    }`}
                    onClick={() => handleSelect(group.id)}
                  >
                    <div className="scope-option-left">
                      <div className="scope-option-icon">
                        <Layers size={16} />
                      </div>
                      <span>{group.name}</span>
                    </div>

                    {selectedValue === group.id && <Check size={16} />}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* CREATE GROUP BUTTON */}
          {/* ACTION BUTTONS */}
          <div className="scope-divider" />

          <div className="scope-actions">
            <button
              type="button"
              className="scope-create-btn"
              onClick={() => {
                setOpen(false);
                router.push("/groups/create");
              }}
            >
              + Create Group
            </button>

            <button
              type="button"
              className="scope-join-btn"
              onClick={() => {
                setOpen(false);
                router.push("/groups/join");
              }}
            >
              Join Group
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
