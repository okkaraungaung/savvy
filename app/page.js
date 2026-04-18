"use client";

import { useEffect, useState } from "react";
import Dashboard from "@/components/Dashboard";
import Header from "@/components/Header";
import IntroPage from "./intro/page";

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const introPlayed = sessionStorage.getItem("introPlayed");

    if (!introPlayed) {
      setShowIntro(true);

      const timer = setTimeout(() => {
        setShowIntro(false);
        sessionStorage.setItem("introPlayed", "true");
        setLoading(false);
      }, 3000); // intro duration

      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, []);

  if (loading && !showIntro) return null;

  if (showIntro) {
    return <IntroPage />;
  }

  return (
    <main className="page-wrap">
      <div className="container">
        <Header />
        <Dashboard />
      </div>
    </main>
  );
}