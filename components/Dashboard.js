"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { defaultState, loadState, saveState } from "@/lib/storage";
import AssetCard from "./AssetCard";
import GoalCard from "./GoalCard";

export default function Dashboard() {
  const [state, setState] = useState(defaultState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const saved = loadState();
    setState(saved);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    saveState(state);
  }, [state, isReady]);

  const totalAssets = useMemo(() => state.assets.length, [state.assets]);
  const totalGoals = useMemo(() => state.goals.length, [state.goals]);
  const totalTransactions = useMemo(
    () => state.transactions.length,
    [state.transactions],
  );

  const previewAssets = state.assets.slice(0, 3);
  const previewGoals = state.goals.slice(0, 3);
  const previewTransactions = state.transactions.slice(-5).reverse();

  if (!isReady) {
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

        <div className="card">
          {previewTransactions.length === 0 ? (
            <p className="muted">No transactions yet.</p>
          ) : (
            <div className="transaction-list">
              {previewTransactions.map((tx) => (
                <div key={tx.id} className="transaction-item">
                  <div>
                    <p className="transaction-amount">
                      {tx.type === "deposit" ? "+" : "-"} {tx.amount} {tx.unit}
                    </p>
                    <p className="muted">
                      {tx.assetName} • {tx.assetCategory}
                    </p>
                    {tx.note ? <p className="muted">{tx.note}</p> : null}
                  </div>

                  <div className="muted">
                    {new Date(tx.date).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}