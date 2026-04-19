"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AddTransactionForm from "@/components/AddTransactionForm";
import TransactionList from "@/components/TransactionList";
import { defaultState, loadState, saveState } from "@/lib/storage";

export default function TransactionsPage() {
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

  function addTransaction(tx) {
    setState((prev) => {
      const existingAsset = prev.assets.find(
        (asset) =>
          asset.category === tx.assetCategory &&
          asset.name.toLowerCase() === tx.assetName.toLowerCase(),
      );

      if (
        existingAsset &&
        tx.type === "withdraw" &&
        existingAsset.amount < tx.amount
      ) {
        alert("Not enough asset balance!");
        return prev;
      }

      if (!existingAsset && tx.type === "withdraw") {
        alert("Cannot withdraw from non-existing asset!");
        return prev;
      }

      const selectedGoal = tx.goalId
        ? prev.goals.find((goal) => goal.id === tx.goalId)
        : null;

      if (
        selectedGoal &&
        tx.type === "withdraw" &&
        selectedGoal.current < tx.amount
      ) {
        alert("Not enough goal balance!");
        return prev;
      }

      let updatedAssets;

      if (existingAsset) {
        updatedAssets = prev.assets.map((asset) => {
          if (
            asset.category !== tx.assetCategory ||
            asset.name.toLowerCase() !== tx.assetName.toLowerCase()
          ) {
            return asset;
          }

          const rawAmount =
            tx.type === "deposit"
              ? asset.amount + tx.amount
              : asset.amount - tx.amount;

          const nextAmount = Number(rawAmount.toFixed(8));

          return {
            ...asset,
            amount: nextAmount < 0 ? 0 : nextAmount,
          };
        });
      } else {
        updatedAssets = [
          ...prev.assets,
          {
            id: crypto.randomUUID(),
            category: tx.assetCategory,
            name: tx.assetName,
            amount: Number(tx.amount.toFixed(8)),
            unit: tx.unit,
            note: tx.note || "",
          },
        ];
      }

      const updatedGoals = prev.goals.map((goal) => {
        if (goal.id !== tx.goalId) return goal;

        const rawCurrent =
          tx.type === "deposit"
            ? goal.current + tx.amount
            : goal.current - tx.amount;

        const nextCurrent = Number(rawCurrent.toFixed(8));

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

  if (!isReady) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <main className="page-wrap">
      <div className="container">
        <div className="header">
          <div>
            <h1>Transactions</h1>
            <p>Add and view your transactions</p>
          </div>
        </div>

        <div className="page-section">
          <AddTransactionForm
            assets={state.assets}
            goals={state.goals}
            onAddTransaction={addTransaction}
          />
        </div>

        <div className="page-section">
          <TransactionList transactions={state.transactions} />
        </div>
      </div>
    </main>
  );
}
