"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  function isActive(path) {
    return pathname === path ? "nav-link active" : "nav-link";
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

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* LEFT - LOGO */}
        <div className="nav-left">
          <Link href="/" className="logo">
            <img src="/logotran.png" alt="Savvy Logo" />
            <span className="logo-text">Savvy</span>
          </Link>
        </div>

        {/* CENTER - LINKS */}
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

        {/* RIGHT - LOGIN */}
        <div className="nav-right">
          {!user && (
            <Link href="/auth/login" className="login-btn-nav">
              Login
            </Link>
          )}

          {user && <LogoutButton />}
        </div>
      </div>
    </nav>
  );
}
