"use client";

import { useState, useEffect } from "react";

const categories = ["currency", "crypto", "metal", "other"];

export default function AddAssetForm({ onAddAsset }) {
  const [category, setCategory] = useState("currency");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");
  const [note, setNote] = useState("");

  // ✅ NEW: message state
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | error

  // ✅ auto-hide message
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  function showMessage(type, text) {
    setMessageType(type);
    setMessage(text);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const parsedAmount = Number(amount);

    // ✅ validation with messages
    if (!name.trim()) {
      showMessage("error", "Please enter asset name.");
      return;
    }

    if (!unit.trim()) {
      showMessage("error", "Please enter unit.");
      return;
    }

    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      showMessage("error", "Amount must be valid and >= 0.");
      return;
    }

    try {
      onAddAsset({
        category,
        name: name.trim(),
        amount: parsedAmount,
        unit: unit.trim(),
        note: note.trim(),
      });

      // reset form
      setCategory("currency");
      setName("");
      setAmount("");
      setUnit("");
      setNote("");

      // success message
      showMessage("success", "Asset added successfully!");
    } catch (err) {
      showMessage("error", "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="goal-form-card asset-form-card">
      <div className="goal-form-header">
        <div>
          <h2>Add New Asset</h2>
          <p className="muted">
            Add a new asset to track your savings, metals, or crypto.
          </p>
        </div>
      </div>

      {/* MESSAGE BOX */}
      {message && (
        <div className={`form-message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="goal-form-grid">
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