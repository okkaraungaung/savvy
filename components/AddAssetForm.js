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

    if (!name || !unit || Number.isNaN(parsedAmount) || parsedAmount < 0)
      return;

    onAddAsset({
      category,
      name,
      amount: parsedAmount,
      unit,
      note,
    });

    setCategory("currency");
    setName("");
    setAmount("");
    setUnit("");
    setNote("");
  }

  return (
    <form onSubmit={handleSubmit} className="card form-card">
      <h2>Add New Asset</h2>

      <div className="form-grid">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Asset name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          step="any"
          placeholder="Starting amount"
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
        Add New Asset
      </button>
    </form>
  );
}
