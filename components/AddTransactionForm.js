"use client";

import { useEffect, useMemo, useState } from "react";

const categories = ["currency", "crypto", "metal", "other"];

export default function AddTransactionForm({
  assets,
  goals = [],
  onAddTransaction,
}) {
  const [assetCategory, setAssetCategory] = useState("currency");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [type, setType] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");
  const [note, setNote] = useState("");

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => asset.category === assetCategory);
  }, [assets, assetCategory]);

  const filteredGoals = useMemo(() => {
    if (!unit.trim()) return [];

    return goals.filter(
      (goal) =>
        goal.unit && goal.unit.toLowerCase() === unit.trim().toLowerCase(),
    );
  }, [goals, unit]);

  useEffect(() => {
    if (filteredAssets.length > 0) {
      const first = filteredAssets[0];
      setSelectedAsset(first.name);
      setUnit(first.unit || "");
    } else {
      setSelectedAsset("");
      setUnit("");
    }

    setSelectedGoalId("");
  }, [filteredAssets]);

  function handleCategoryChange(value) {
    setAssetCategory(value);
  }

  function handleAssetSelect(value) {
    setSelectedAsset(value);
    setSelectedGoalId("");

    const selected = filteredAssets.find((asset) => asset.name === value);

    if (selected) {
      setUnit(selected.unit || "");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    const parsed = Number(amount);

    if (!selectedAsset || !unit.trim() || Number.isNaN(parsed) || parsed <= 0) {
      return;
    }

    onAddTransaction({
      id: crypto.randomUUID(),
      assetCategory,
      assetName: selectedAsset,
      type,
      amount: parsed,
      unit: unit.trim(),
      note: note.trim(),
      goalId: selectedGoalId || null,
      date: new Date().toISOString(),
    });

    setAmount("");
    setNote("");
    setType("deposit");
    setSelectedGoalId("");
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
          value={selectedAsset}
          onChange={(e) => handleAssetSelect(e.target.value)}
          disabled={filteredAssets.length === 0}
        >
          {filteredAssets.length === 0 ? (
            <option value="">No assets in this category</option>
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

        <input type="text" value={unit} readOnly placeholder="Unit" />

        <select
          value={selectedGoalId}
          onChange={(e) => setSelectedGoalId(e.target.value)}
          disabled={!unit.trim()}
        >
          <option value="">No goal</option>
          {filteredGoals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.title} ({goal.unit})
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <button type="submit" className="primary-btn" disabled={!selectedAsset}>
        Save Transaction
      </button>
    </form>
  );
}
