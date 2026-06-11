"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GROUP_MEMBERSHIP_CHANGED_EVENT } from "@/lib/groupMembershipEvents";
import {
  ChevronDown,
  Check,
  Info,
  Layers,
  LogOut,
  Plus,
  Settings,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ScopeSwitcher() {
  const supabaseRef = useRef(null);
  if (!supabaseRef.current) {
    supabaseRef.current = createClient();
  }

  const supabase = supabaseRef.current;
  const router = useRouter();

  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedValue, setSelectedValue] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef(null);
  const loadRequestIdRef = useRef(0);

  useEffect(() => {
    let isActive = true;

    async function loadScope() {
      const requestId = ++loadRequestIdRef.current;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!isActive || requestId !== loadRequestIdRef.current) return;

        if (!user) {
          setLoading(false);
          return;
        }

        const { data: memberships, error: membershipsError } = await supabase
          .from("group_members")
          .select("group_id, groups(id, name)")
          .eq("user_id", user.id);

        if (!isActive || requestId !== loadRequestIdRef.current) return;

        if (membershipsError) {
          setGroups([]);
          setSelectedValue("personal");
          return;
        }

        const groupList =
          memberships?.map((item) => item.groups).filter(Boolean) || [];

        setGroups(groupList);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("current_group_id")
          .eq("id", user.id)
          .maybeSingle();

        if (!isActive || requestId !== loadRequestIdRef.current) return;

        if (profileError) {
          setSelectedValue("personal");
          return;
        }

        if (profile?.current_group_id) {
          setSelectedValue(profile.current_group_id);
        } else {
          setSelectedValue("personal");
        }
      } finally {
        if (isActive && requestId === loadRequestIdRef.current) {
          setLoading(false);
        }
      }
    }

    function handleGroupMembershipChanged() {
      loadScope();
    }

    loadScope();

    window.addEventListener(
      GROUP_MEMBERSHIP_CHANGED_EVENT,
      handleGroupMembershipChanged,
    );

    return () => {
      isActive = false;
      window.removeEventListener(
        GROUP_MEMBERSHIP_CHANGED_EVENT,
        handleGroupMembershipChanged,
      );
    };
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

  async function handleLogout() {
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/auth/login");
    router.refresh();
  }

  const selectedGroup = groups.find((group) => group.id === selectedValue);

  const selectedLabel =
    selectedValue === "personal"
      ? "Personal"
      : selectedGroup?.name || "Select scope";

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "My profile";

  const avatarUrl = user?.user_metadata?.avatar_url;
  const userEmail = user?.email || "";
  const workspaceOptions = [
    { id: "personal", name: "Personal", type: "personal" },
    ...groups.map((group) => ({
      id: group.id,
      name: group.name,
      type: "group",
    })),
  ];
  const selectedWorkspaceOption = workspaceOptions.find(
    (workspace) => workspace.id === selectedValue,
  );
  const visibleWorkspaceOptions = selectedWorkspaceOption
    ? [
        selectedWorkspaceOption,
        ...workspaceOptions.filter(
          (workspace) => workspace.id !== selectedWorkspaceOption.id,
        ),
      ].slice(0, 2)
    : workspaceOptions.slice(0, 2);
  const hiddenWorkspaceCount = Math.max(workspaceOptions.length - 2, 0);

  if (loading) return null;

  return (
    <div
      className={`scope-switcher compact ${open ? "open" : ""}`}
      ref={wrapperRef}
    >
      {/* TRIGGER */}
      <button
        type="button"
        className="scope-trigger account-trigger modern-trigger"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="account-trigger-left">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="account-trigger-avatar" />
          ) : (
            <span className="account-trigger-avatar account-trigger-avatar-fallback">
              <User size={17} />
            </span>
          )}

          <div className="scope-trigger-text">
            <span className="account-trigger-name">{displayName}</span>

            <span className="scope-trigger-value">{selectedLabel}</span>
          </div>
        </div>

        <ChevronDown size={18} className="scope-chevron" />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="scope-menu account-menu">
          <div className="account-menu-profile">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="account-menu-avatar" />
            ) : (
              <span className="account-menu-avatar account-menu-avatar-fallback">
                <User size={20} />
              </span>
            )}

            <div className="account-menu-profile-text">
              <p>{displayName}</p>
              <strong>{selectedLabel} workspace</strong>
              {userEmail && <span>{userEmail}</span>}
            </div>
          </div>

          <div className="account-menu-links">
            <Link
              href="/profile"
              className="dropdown-item account-menu-link"
              onClick={() => setOpen(false)}
            >
              <User size={18} />
              <span>My profile</span>
            </Link>

            <Link
              href="/settings"
              className="dropdown-item account-menu-link"
              onClick={() => setOpen(false)}
            >
              <Settings size={18} />
              <span>Account settings</span>
            </Link>
          </div>

          <div className="scope-menu-group">
            <p className="scope-menu-title">SWITCH WORKSPACE</p>

            {visibleWorkspaceOptions.map((workspace) => (
              <button
                key={workspace.id}
                type="button"
                className={`scope-option ${
                  selectedValue === workspace.id ? "active" : ""
                }`}
                onClick={() => handleSelect(workspace.id)}
              >
                <div className="scope-option-left">
                  <div className="scope-option-icon account-option-avatar">
                    {workspace.type === "personal" ? (
                      <User size={16} />
                    ) : (
                      <Layers size={16} />
                    )}
                  </div>

                  <span>{workspace.name}</span>
                </div>

                {selectedValue === workspace.id && <Check size={16} />}
              </button>
            ))}

            {hiddenWorkspaceCount > 0 && (
              <button
                type="button"
                className="scope-option scope-more-option"
                onClick={() => {
                  setOpen(false);
                  router.push("/groups");
                }}
              >
                <div className="scope-option-left">
                  <div className="scope-option-icon account-option-avatar">
                    <Layers size={16} />
                  </div>

                  <span>{hiddenWorkspaceCount} more workspaces</span>
                </div>

                <span className="scope-more-arrow">View</span>
              </button>
            )}
          </div>

          <div className="scope-divider" />

          <div className="scope-actions modern-actions">
            <button
              type="button"
              className="scope-create-btn"
              onClick={() => {
                setOpen(false);
                router.push("/groups/create");
              }}
            >
              <Plus size={16} />
              Create Group
            </button>

            <button
              type="button"
              className="scope-join-btn"
              onClick={() => {
                setOpen(false);
                router.push("/groups/join");
              }}
            >
              <Users size={16} />
              Join Group
            </button>
          </div>

          {workspaceOptions.length > 2 && (
            <>
              <div className="scope-divider" />

              <button
                type="button"
                className="scope-groups-link"
                onClick={() => {
                  setOpen(false);
                  router.push("/groups");
                }}
              >
                Manage workspaces →
              </button>
            </>
          )}

          <div className="scope-divider" />

          <Link
            href="/about"
            className="dropdown-item account-menu-link account-about-link"
            onClick={() => setOpen(false)}
          >
            <Info size={18} />
            <span>About Savvy</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="dropdown-item logout-dropdown-btn account-signout-btn"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}
