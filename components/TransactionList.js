"use client";

import { useState } from "react";
import TransactionCard from "./TransactionCard";

export default function TransactionList({ transactions = [] }) {
  const [filter, setFilter] = useState("all");

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.type === filter;
  });

  return (
    <div className="card transaction-card">
      <div className="transaction-card-header">
        <div>
          <h2>Recent Transactions</h2>
          <p className="muted">Track your deposits and withdrawals.</p>
        </div>

        <span className="transaction-count">{filteredTransactions.length}</span>
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
          filteredTransactions
            .slice()
            .reverse()
            .map((tx) => <TransactionCard key={tx.id} tx={tx} />)
        )}
      </div>
    </div>
  );
}
