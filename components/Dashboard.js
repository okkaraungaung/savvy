"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AssetCard from "./AssetCard";
import GoalCard from "./GoalCard";

export default function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | deposit | withdraw

  const supabase = createClient();

  function formatDate(dateString) {
    if (!dateString) return "-";

    let safeDate = String(dateString).trim();
    safeDate = safeDate.replace(" ", "T");
    safeDate = safeDate.replace(/\.(\d{3})\d+/, ".$1");
    safeDate = safeDate.replace(/\+00:00$/, "Z");
    safeDate = safeDate.replace(/\+00$/, "Z");

    const date = new Date(safeDate);

    if (Number.isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setAssets([]);
        setGoals([]);
        setTransactions([]);
        setLoading(false);
        return;
      }

      const [
        { data: assetsData, error: assetsError },
        { data: goalsData, error: goalsError },
        { data: transactionsData, error: transactionsError },
      ] = await Promise.all([
        supabase
          .from("assets")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("goals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (assetsError || goalsError || transactionsError) {
        setAssets([]);
        setGoals([]);
        setTransactions([]);
        setLoading(false);
        return;
      }

      setAssets(assetsData || []);
      setGoals(goalsData || []);
      setTransactions(transactionsData || []);
      setLoading(false);
    }

    fetchData();
  }, []);

  const totalAssets = useMemo(
    () => assets.filter((a) => Number(a.amount) > 0).length,
    [assets],
  );

  const totalGoals = useMemo(() => goals.length, [goals]);
  const totalTransactions = useMemo(() => transactions.length, [transactions]);

  const previewAssets = assets.filter((a) => Number(a.amount) > 0).slice(0, 3);
  const previewGoals = goals.slice(0, 3);

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((tx) => tx.type === filter);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-space">
      <section className="summary-grid">
        <div className="summary-card summary-dark">
          <p>Tracked Assets</p>
          <h2>{totalAssets}</h2>
        </div>

        <div className="summary-card">
          <p>Savings Goals</p>
          <h2>{totalGoals}</h2>
        </div>

        <div className="summary-card">
          <p>Transactions</p>
          <h2>{totalTransactions}</h2>
        </div>
      </section>

      <section>
        <div className="section-head section-head-row">
          <h2>Assets Overview</h2>
          <Link href="/assets" className="arrow-btn">
            <span>Manage Assets</span>
            <span className="arrow-circle">→</span>
          </Link>
        </div>

        <div className="asset-grid">
          {previewAssets.length === 0 ? (
            <div className="card">
              <p className="muted">No assets yet.</p>
            </div>
          ) : (
            previewAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))
          )}
        </div>
      </section>

      <section>
        <div className="section-head section-head-row">
          <h2>Goals Overview</h2>
          <Link href="/goals" className="arrow-btn">
            <span>View Goals</span>
            <span className="arrow-circle">→</span>
          </Link>
        </div>

        <div className="goal-grid">
          {previewGoals.length === 0 ? (
            <div className="card">
              <p className="muted">No goals yet.</p>
            </div>
          ) : (
            previewGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)
          )}
        </div>
      </section>

      <section>
        <div className="section-head section-head-row">
          <h2>Recent Transactions</h2>
          <Link href="/transactions" className="arrow-btn">
            <span>View Transactions</span>
            <span className="arrow-circle">→</span>
          </Link>
        </div>

        <div className="transaction-filter">
          <button
            type="button"
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            type="button"
            className={
              filter === "deposit" ? "active deposit-btn" : "deposit-btn"
            }
            onClick={() => setFilter("deposit")}
          >
            Deposit
          </button>

          <button
            type="button"
            className={
              filter === "withdraw" ? "active withdraw-btn" : "withdraw-btn"
            }
            onClick={() => setFilter("withdraw")}
          >
            Withdraw
          </button>
        </div>

        <div className="transaction-list modern-transaction-list">
          {filteredTransactions.length === 0 ? (
            <div className="transaction-empty">
              <div className="transaction-empty-icon">💸</div>
              <h3>No transactions</h3>
              <p className="muted">No data for this filter.</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isDeposit = tx.type === "deposit";

              return (
                <div
                  key={tx.id}
                  className="transaction-item modern-transaction-item"
                >
                  <div
                    className={`transaction-icon ${
                      isDeposit ? "deposit" : "withdraw"
                    }`}
                  >
                    {isDeposit ? "↗" : "↘"}
                  </div>

                  <div className="transaction-main">
                    <div className="transaction-top-row">
                      <p
                        className={`transaction-amount ${
                          isDeposit ? "deposit-text" : "withdraw-text"
                        }`}
                      >
                        {isDeposit ? "+" : "-"} {tx.amount} {tx.unit}
                      </p>

                      <span
                        className={`transaction-badge ${
                          isDeposit ? "deposit-badge" : "withdraw-badge"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </div>

                    <p className="transaction-asset">
                      {tx.asset_name || tx.assetName} <span>•</span>{" "}
                      {tx.asset_category || tx.assetCategory || tx.assetType}
                    </p>

                    {tx.note ? (
                      <p className="transaction-note">{tx.note}</p>
                    ) : null}
                  </div>

                  <div className="transaction-date">
                    {formatDate(tx.created_at || tx.date)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
