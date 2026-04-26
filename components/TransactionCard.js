"use client";

export default function TransactionCard({ tx }) {
  const isDeposit = tx.type === "deposit";

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
    <div className="transaction-item modern-transaction-item">
      <div className={`transaction-icon ${isDeposit ? "deposit" : "withdraw"}`}>
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

        <p className="muted">By: {tx.displayUserName || "Unknown User"}</p>

        {tx.note ? <p className="transaction-note">{tx.note}</p> : null}
      </div>

      <div className="transaction-date">
        {formatDate(tx.created_at || tx.date)}
      </div>
    </div>
  );
}
