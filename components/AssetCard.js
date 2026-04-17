const assetEmoji = {
  cash: "💵",
  gold: "🪙",
  crypto: "₿",
};

export default function AssetCard({ asset }) {
  return (
    <div className="card asset-card">
      <div className="asset-top">
        <div>
          <p className="asset-type">{asset.type}</p>
          <h3>{asset.name}</h3>
        </div>
        <span className="asset-emoji">{assetEmoji[asset.type]}</span>
      </div>

      <p className="asset-amount">
        {asset.amount} <span>{asset.unit}</span>
      </p>

      {asset.note ? <p className="muted">{asset.note}</p> : null}
    </div>
  );
}
