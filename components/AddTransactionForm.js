"use client";

import { useMemo, useState } from "react";

export default function AddTransactionForm({ assets, onAddTransaction }) {
  const [assetType, setAssetType] = useState("cash");
  const [assetName, setAssetName] = useState("Cash Savings");
  const [type, setType] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("THB");
  const [note, setNote] = useState("");

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => asset.type === assetType);
  }, [assets, assetType]);

  function handleAssetTypeChange(value) {
    setAssetType(value);
    const first = assets.find((asset) => asset.type === value);

    if (first) {
      setAssetName(first.name);
      setUnit(first.unit);
    } else {
      setAssetName("");
      setUnit("");
    }
  }

  function handleAssetNameChange(value) {
    setAssetName(value);
    const selected = assets.find((asset) => asset.name === value);
    if (selected) setUnit(selected.unit);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const parsed = Number(amount);
    if (!assetName || !unit || Number.isNaN(parsed) || parsed <= 0) return;

    onAddTransaction({
      id: crypto.randomUUID(),
      assetType,
      assetName,
      type,
      amount: parsed,
      unit,
      note,
      date: new Date().toISOString(),
    });

    setAmount("");
    setNote("");
  }

  return (
    <form onSubmit={handleSubmit} className="card form-card">
      <h2>Add Transaction</h2>

      <div className="form-grid">
        <select
          value={assetType}
          onChange={(e) => handleAssetTypeChange(e.target.value)}
        >
          <option value="cash">Cash</option>
          <option value="gold">Gold</option>
          <option value="crypto">Crypto</option>
        </select>

        <select
          value={assetName}
          onChange={(e) => handleAssetNameChange(e.target.value)}
        >
          {filteredAssets.map((asset) => (
            <option key={asset.id} value={asset.name}>
              {asset.name}
            </option>
          ))}
        </select>

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="deposit">Deposit</option>
          <option value="withdraw">Withdraw</option>
        </select>
        <input
          type="number"
          step="any"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          type="text"
          placeholder="Unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />

        <input
          type="text"
          placeholder="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <button type="submit" className="primary-btn">
        Save Transaction
      </button>
    </form>
  );
}
