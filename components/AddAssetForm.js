"use client";

import { useState } from "react";

const categories = ["currency", "crypto", "metal", "other"];

export default function AddAssetForm({ onAddAsset }) {
  const [category, setCategory] = useState("currency");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");
  const [note, setNote] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    const parsedAmount = Number(amount);

    if (!name.trim() || !unit.trim() || Number.isNaN(parsedAmount) || parsedAmount < 0) {
      return;
    }

    onAddAsset({
      category,
      name: name.trim(),
      amount: parsedAmount,
      unit: unit.trim(),
      note: note.trim(),
    });

    setCategory("currency");
    setName("");
    setAmount("");
    setUnit("");
    setNote("");
  }

  return (
    <form onSubmit={handleSubmit} className="card form-card asset-form-card">
      <div className="asset-form-header">
        <div>
          <h2>Add New Asset</h2>
          <p className="muted">
            Add a new asset to track your savings, metals, or crypto.
          </p>
        </div>
      </div>

      <div className="form-grid asset-form-grid">
        <div className="field-group">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label>Asset Name</label>
          <input
            type="text"
            placeholder="e.g. US Dollar, Bitcoin, Gold"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Starting Amount</label>
          <input
            type="number"
            step="any"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Unit</label>
          <input
            type="text"
            placeholder="e.g. USD, BTC, XAU"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>

        <div className="field-group asset-form-note">
          <label>Note</label>
          <input
            type="text"
            placeholder="Optional note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      <button type="submit" className="primary-btn asset-save-btn">
        Add New Asset
      </button>
    </form>
  );
}