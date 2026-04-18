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
        <h2 className="logo">Savvy</h2>

        <div className="nav-links">
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
        </div>
      </div>
    </nav>
  );
}
