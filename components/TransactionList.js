"use client";

import { useState } from "react";

export default function TransactionList({ transactions = [] }) {
  const [filter, setFilter] = useState("all");

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.type === filter;
  });

  function formatDate(dateString) {
    if (!dateString) return "-";

    let safeDate = String(dateString).trim();
    safeDate = safeDate.replace(" ", "T");
    safeDate = safeDate.replace(/\.(\d{3})\d+/, ".$1");
    safeDate = safeDate.replace(/\+00:00$/, "Z");
    safeDate = safeDate.replace(/\+00$/, "Z");

    const date = new Date(safeDate);

    if (Number.isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleString();
  }

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
        <button onClick={() => setFilter("all")}>All</button>

        <button onClick={() => setFilter("deposit")}>Deposit</button>

        <button onClick={() => setFilter("withdraw")}>Withdraw</button>
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
            .map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div>
                  <p className="transaction-amount">
                    {tx.type === "deposit" ? "+" : "-"} {tx.amount} {tx.unit}
                  </p>
                  <p className="muted">
                    {tx.asset_name || tx.assetName} •{" "}
                    {tx.asset_category || tx.assetCategory}
                  </p>
                  {tx.note && <p className="muted">{tx.note}</p>}
                </div>

                <div className="muted">
                  {formatDate(tx.created_at || tx.date)}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
