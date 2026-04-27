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
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | error

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => asset.category === assetCategory);
  }, [assets, assetCategory]);

  const filteredGoals = useMemo(() => {
    if (!unit.trim()) return [];

    return goals.filter(
      (goal) =>
        goal.unit && goal.unit.toLowerCase() === unit.trim().toLowerCase()
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

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

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

  function showMessage(type, text) {
    setMessageType(type);
    setMessage(text);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const parsed = Number(amount);

    if (!selectedAsset) {
      showMessage("error", "Please select an asset.");
      return;
    }

    if (!unit.trim()) {
      showMessage("error", "Unit is missing for this asset.");
      return;
    }

    if (Number.isNaN(parsed) || parsed <= 0) {
      showMessage("error", "Please enter a valid amount greater than 0.");
      return;
    }

    try {
      onAddTransaction({
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

      showMessage("success", "Transaction saved successfully.");
    } catch (error) {
      showMessage("error", "Something went wrong while saving.");
    }
  }

  return (
  <form onSubmit={handleSubmit} className="goal-form-card transaction-form-card">
    <div className="goal-form-header">
      <div>
        <h2>Add Transaction</h2>
        <p>Record a deposit or withdrawal for your asset.</p>
      </div>
    </div>

    {message && (
      <div className={`form-message ${messageType}`}>
        {message}
      </div>
    )}

    <div className="type-toggle">
      <button
        type="button"
        className={type === "deposit" ? "active deposit" : ""}
        onClick={() => setType("deposit")}
      >
        Deposit
      </button>

      <button
        type="button"
        className={type === "withdraw" ? "active withdraw" : ""}
        onClick={() => setType("withdraw")}
      >
        Withdraw
      </button>
    </div>

    <div className="goal-form-grid">
      <div className="field-group">
        <label>Asset Category</label>
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
      </div>

      <div className="field-group">
        <label>Asset</label>
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
      </div>

      <div className="field-group">
        <label>Goal</label>
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
      </div>

      <div className="field-group">
        <label>Amount</label>
        <div className={`amount-combined ${type}`}>
          <input
            type="number"
            step="any"
            placeholder="1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span className="unit-tag">{unit || "UNIT"}</span>
        </div>
      </div>

      <div className="field-group full">
        <label>Note</label>
        <input
          type="text"
          placeholder="Write a short note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
    </div>

    <button
      type="submit"
      className="goal-submit-btn transaction-save-btn"
      disabled={!selectedAsset}
    >
      Save Transaction
    </button>
  </form>
);
}