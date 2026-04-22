const assetEmoji = {
  currency: "💵",
  metal: "🪙",
  crypto: "₿",
  other: "📦",
};

export default function AssetCard({ asset }) {
  return (
    <div className="card asset-card modern-asset-card">
      <div className="asset-card-header">
        <div className="asset-info">
          <p className="asset-type">{asset.category || asset.type}</p>
          <h3 className="asset-name">{asset.name}</h3>
        </div>

        <div className="asset-emoji-badge">
          {assetEmoji[asset.category || asset.type] || "💼"}
        </div>
      </div>

      <div className="asset-value">
        <p className="asset-amount">
          {asset.amount}
          <span className="asset-unit">{asset.unit}</span>
        </p>
      </div>

      {asset.note && (
        <div className="asset-note">
          <p>{asset.note}</p>
        </div>
      )}
    </div>
  );
}