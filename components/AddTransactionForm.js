"use client";

import { useEffect, useMemo, useState } from "react";

const categories = ["currency", "crypto", "gold", "silver", "metal", "other"];

export default function AddTransactionForm({ assets, onAddTransaction }) {
  const [assetCategory, setAssetCategory] = useState("currency");
  const [assetName, setAssetName] = useState("");
  const [type, setType] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");
  const [note, setNote] = useState("");

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => asset.category === assetCategory);
  }, [assets, assetCategory]);

  useEffect(() => {
    if (filteredAssets.length > 0) {
      setAssetName(filteredAssets[0].name);
      setUnit(filteredAssets[0].unit);
    } else {
      setAssetName("");
      setUnit("");
    }
  }, [filteredAssets]);

  function handleCategoryChange(value) {
    setAssetCategory(value);
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
      assetCategory,
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
          value={assetCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={assetName}
          onChange={(e) => handleAssetNameChange(e.target.value)}
        >
          {filteredAssets.length === 0 ? (
            <option value="">No asset in this category</option>
          ) : (
            filteredAssets.map((asset) => (
              <option key={asset.id} value={asset.name}>
                {asset.name}
              </option>
            ))
          )}
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

      <button type="submit" className="primary-btn" disabled={!assetName}>
        Save Transaction
      </button>
    </form>
  );
}
