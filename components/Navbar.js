"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Settings, Bell, LogOut } from "lucide-react";
import ScopeSwitcher from "./ScopeSwitcher";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  function isActive(path) {
    return pathname === path ? "nav-link active" : "nav-link";
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/auth/login");
    router.refresh();
  }

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest(".profile-wrapper")) {
        setOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <Link href="/" className="logo">
            <img src="/logotran.png" alt="Savvy Logo" />
            <span className="logo-text">Savvy</span>
          </Link>
        </div>

        <div className="nav-center">
          {user && (
            <>
              <Link href="/" className={isActive("/")}>
                Dashboard
              </Link>
              <Link href="/assets" className={isActive("/assets")}>
                Assets
              </Link>
              <Link href="/goals" className={isActive("/goals")}>
                Goals
              </Link>
              <Link href="/transactions" className={isActive("/transactions")}>
                Transactions
              </Link>
            </>
          )}
        </div>

        <div className="nav-right">
          {user && <ScopeSwitcher />}
          {!user && (
            <Link href="/auth/login" className="login-btn-nav">
              Login
            </Link>
          )}

          {user && (
            <div className="profile-wrapper">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="User avatar"
                  className="profile-avatar"
                  onClick={() => setOpen((prev) => !prev)}
                />
              ) : (
                <button
                  type="button"
                  className="profile-avatar-fallback"
                  onClick={() => setOpen((prev) => !prev)}
                >
                  <User size={18} />
                </button>
              )}

              {open && (
                <div className="profile-dropdown">
                  <Link
                    href="/profile"
                    className="dropdown-item"
                    onClick={() => setOpen(false)}
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </Link>

                  <Link
                    href="/settings"
                    className="dropdown-item"
                    onClick={() => setOpen(false)}
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </Link>

                  <Link
                    href="/about"
                    className="dropdown-item"
                    onClick={() => setOpen(false)}
                  >
                    <Bell size={18} />
                    <span>About Us</span>
                  </Link>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="dropdown-item logout-dropdown-btn"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
