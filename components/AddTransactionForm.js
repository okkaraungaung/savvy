"use client";

import { useEffect, useMemo, useState } from "react";

const categories = ["currency", "crypto", "gold", "silver", "metal", "other"];
const CUSTOM_OPTION = "__custom__";

export default function AddTransactionForm({ assets, onAddTransaction }) {
  const [assetCategory, setAssetCategory] = useState("currency");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [customAssetName, setCustomAssetName] = useState("");
  const [type, setType] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");
  const [note, setNote] = useState("");

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => asset.category === assetCategory);
  }, [assets, assetCategory]);
  console.log(assets, assetCategory);

  useEffect(() => {
    if (filteredAssets.length > 0) {
      setSelectedAsset(filteredAssets[0].name);
      setCustomAssetName("");
      setUnit(filteredAssets[0].unit);
    } else {
      setSelectedAsset(CUSTOM_OPTION);
      setCustomAssetName("");
      setUnit("");
    }
  }, [filteredAssets]);

  function handleCategoryChange(value) {
    setAssetCategory(value);
  }

  function handleAssetSelect(value) {
    setSelectedAsset(value);

    if (value === CUSTOM_OPTION) {
      setCustomAssetName("");
      setUnit("");
      return;
    }

    const selected = filteredAssets.find((asset) => asset.name === value);
    if (selected) {
      setCustomAssetName("");
      setUnit(selected.unit);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    const parsed = Number(amount);
    const finalAssetName =
      selectedAsset === CUSTOM_OPTION ? customAssetName.trim() : selectedAsset;

    if (
      !finalAssetName ||
      !unit.trim() ||
      Number.isNaN(parsed) ||
      parsed <= 0
    ) {
      return;
    }

    onAddTransaction({
      id: crypto.randomUUID(),
      assetCategory,
      assetName: finalAssetName,
      type,
      amount: parsed,
      unit: unit.trim(),
      note: note.trim(),
      date: new Date().toISOString(),
    });

    setAmount("");
    setNote("");
    setType("deposit");

    if (filteredAssets.length > 0) {
      setSelectedAsset(filteredAssets[0].name);
      setCustomAssetName("");
      setUnit(filteredAssets[0].unit);
    } else {
      setSelectedAsset(CUSTOM_OPTION);
      setCustomAssetName("");
      setUnit("");
    }
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
        >
          {filteredAssets.map((asset) => (
            <option key={asset.id} value={asset.name}>
              {asset.name}
            </option>
          ))}
          <option value={CUSTOM_OPTION}>Custom asset</option>
        </select>

        {selectedAsset === CUSTOM_OPTION && (
          <input
            type="text"
            placeholder="Enter asset name"
            value={customAssetName}
            onChange={(e) => setCustomAssetName(e.target.value)}
          />
        )}

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
          placeholder="Unit (USD, BTC, ETH, oz, gram)"
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
