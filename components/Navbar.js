"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  function isActive(path) {
    return pathname === path ? "nav-link active" : "nav-link";
  }

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
          <Link href="/" className={isActive("/")}>Dashboard</Link>
          <Link href="/assets" className={isActive("/assets")}>Assets</Link>
          <Link href="/goals" className={isActive("/goals")}>Goals</Link>
          <Link href="/transactions" className={isActive("/transactions")}>Transactions</Link>
        </div>

        {/* RIGHT - LOGIN */}
        <div className="nav-right">
          <Link href="/login" className="login-btn-nav">
            Login
          </Link>
        </div>

      </div>
    </nav>
  );
}