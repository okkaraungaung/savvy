"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { defaultState, loadState, saveState } from "@/lib/storage";
import AssetCard from "./AssetCard";
import AddGoalForm from "./AddGoalForm";
import AddTransactionForm from "./AddTransactionForm";
import GoalCard from "./GoalCard";
import TransactionList from "./TransactionList";

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

  function addTransaction(tx) {
    setState((prev) => {
      const updatedAssets = prev.assets.map((asset) => {
        if (asset.name !== tx.assetName || asset.category !== tx.assetCategory)
          return asset;

        const nextAmount =
          tx.type === "deposit"
            ? asset.amount + tx.amount
            : asset.amount - tx.amount;

        return {
          ...asset,
          amount: nextAmount < 0 ? 0 : nextAmount,
        };
      });

      const updatedGoals = prev.goals.map((goal) => {
        if (goal.assetCategory !== tx.assetCategory || goal.unit !== tx.unit)
          return goal;

        const nextCurrent =
          tx.type === "deposit"
            ? goal.current + tx.amount
            : goal.current - tx.amount;

        return {
          ...goal,
          current: nextCurrent < 0 ? 0 : nextCurrent,
        };
      });

      return {
        ...prev,
        assets: updatedAssets,
        goals: updatedGoals,
        transactions: [...prev.transactions, tx],
      };
    });
  }

  function addGoal(goal) {
    setState((prev) => ({
      ...prev,
      goals: [...prev.goals, goal],
    }));
  }

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
          <h2>Assets</h2>
          <Link href="/assets" className="primary-btn link-btn">
            Manage Assets
          </Link>
        </div>

        <div className="asset-grid">
          {state.assets.slice(0, 3).map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </section>

      <section className="two-col-grid">
        <AddTransactionForm
          assets={state.assets}
          onAddTransaction={addTransaction}
        />
        <AddGoalForm onAddGoal={addGoal} />
      </section>

      <section>
        <div className="section-head">
          <h2>Goals</h2>
        </div>
        <div className="goal-grid">
          {state.goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </section>

      <section>
        <TransactionList transactions={state.transactions} />
      </section>
    </div>
  );
}
