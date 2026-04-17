export default function TransactionList({ transactions }) {
  return (
    <div className="card">
      <h2>Recent Transactions</h2>

      <div className="transaction-list">
        {transactions.length === 0 ? (
          <p className="muted">No transactions yet.</p>
        ) : (
          transactions
            .slice()
            .reverse()
            .map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div>
                  <p className="transaction-amount">
                    {tx.type === "deposit" ? "+" : "-"} {tx.amount} {tx.unit}
                  </p>
                  <p className="muted">
                    {tx.assetName} • {tx.assetType}
                  </p>
                  {tx.note ? <p className="muted">{tx.note}</p> : null}
                </div>
                <div className="muted">
                  {new Date(tx.date).toLocaleString()}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
