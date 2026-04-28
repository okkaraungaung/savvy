"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentScope } from "@/lib/getCurrentScope";
import AssetCard from "./AssetCard";
import GoalCard from "./GoalCard";
import TransactionCard from "./TransactionCard";
import { attachUsersToTransactions } from "@/lib/attachUsersToTransactions";

export default function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const { user, currentGroupId } = await getCurrentScope();

      if (!user) {
        setAssets([]);
        setGoals([]);
        setTransactions([]);
        setLoading(false);
        return;
      }

      let assetsQuery = supabase
        .from("assets")
        .select("*")
        .order("created_at", { ascending: false });

      let goalsQuery = supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false });

      let transactionsQuery = supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (currentGroupId) {
        assetsQuery = assetsQuery.eq("group_id", currentGroupId);
        goalsQuery = goalsQuery.eq("group_id", currentGroupId);
        transactionsQuery = transactionsQuery.eq("group_id", currentGroupId);
      } else {
        assetsQuery = assetsQuery.eq("user_id", user.id).is("group_id", null);
        goalsQuery = goalsQuery.eq("user_id", user.id).is("group_id", null);
        transactionsQuery = transactionsQuery
          .eq("user_id", user.id)
          .is("group_id", null);
      }

      const [
        { data: assetsData, error: assetsError },
        { data: goalsData, error: goalsError },
        { data: transactionsData, error: transactionsError },
      ] = await Promise.all([assetsQuery, goalsQuery, transactionsQuery]);

      if (assetsError || goalsError || transactionsError) {
        setAssets([]);
        setGoals([]);
        setTransactions([]);
        setLoading(false);
        return;
      }

      const transactionsWithUsers = await attachUsersToTransactions({
        supabase,
        transactionsData,
        currentUserId: user.id,
      });

      setAssets(assetsData || []);
      setGoals(goalsData || []);
      setTransactions(transactionsWithUsers);
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

  const previewTransactions = filteredTransactions.slice(0, 5);

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
          {previewTransactions.length === 0 ? (
            <div className="transaction-empty">
              <div className="transaction-empty-icon">💸</div>
              <h3>No transactions</h3>
              <p className="muted">No data for this filter.</p>
            </div>
          ) : (
            previewTransactions.map((tx) => (
              <TransactionCard key={tx.id} tx={tx} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
