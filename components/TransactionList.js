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
        <button
          type="button"
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          type="button"
          className={filter === "deposit" ? "active deposit-btn" : "deposit-btn"}
          onClick={() => setFilter("deposit")}
        >
          Deposit
        </button>

        <button
          type="button"
          className={filter === "withdraw" ? "active withdraw-btn" : "withdraw-btn"}
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
            .map((tx) => {
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
                      {tx.asset_category || tx.assetCategory}
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
    </div>
  );
}