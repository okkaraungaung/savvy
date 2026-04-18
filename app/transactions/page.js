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
      const updatedAssets = prev.assets.map((asset) => {
        if (asset.name !== tx.assetName || asset.category !== tx.assetCategory)
          return asset;

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

      return {
        ...prev,
        assets: updatedAssets,
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
