"use client";

import { useState } from "react";

export default function TransactionList({ transactions }) {
  const [filter, setFilter] = useState("all"); // all | deposit | withdraw

  function formatDate(date) {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((tx) => tx.type === filter);

  return (
    <div className="card transaction-card">
      {/* HEADER */}
      <div className="transaction-card-header">
        <div>
          <h2>Recent Transactions</h2>
          <p className="muted">Track your deposits and withdrawals.</p>
        </div>

        <span className="transaction-count">
          {filteredTransactions.length}
        </span>
      </div>

      {/* FILTER BUTTONS */}
      <div className="transaction-filter">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          className={filter === "deposit" ? "active deposit-btn" : "deposit-btn"}
          onClick={() => setFilter("deposit")}
        >
          Deposit
        </button>

        <button
          className={filter === "withdraw" ? "active withdraw-btn" : "withdraw-btn"}
          onClick={() => setFilter("withdraw")}
        >
          Withdraw
        </button>
      </div>

      {/* LIST */}
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
                <div key={tx.id} className="transaction-item modern-transaction-item">
                  <div className={`transaction-icon ${isDeposit ? "deposit" : "withdraw"}`}>
                    {isDeposit ? "↗" : "↘"}
                  </div>

                  <div className="transaction-main">
                    <div className="transaction-top-row">
                      <p className={`transaction-amount ${isDeposit ? "deposit-text" : "withdraw-text"}`}>
                        {isDeposit ? "+" : "-"} {tx.amount} {tx.unit}
                      </p>

                      <span className={`transaction-badge ${isDeposit ? "deposit-badge" : "withdraw-badge"}`}>
                        {tx.type}
                      </span>
                    </div>

                    <p className="transaction-asset">
                      {tx.assetName} <span>•</span> {tx.assetType}
                    </p>

                    {tx.note ? <p className="transaction-note">{tx.note}</p> : null}
                  </div>

                  <div className="transaction-date">{formatDate(tx.date)}</div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}