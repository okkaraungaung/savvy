"use client";

import { useEffect, useMemo, useState } from "react";

function formatAmount(value) {
  return Number(value.toFixed(8)).toString();
}

export default function AssetExchangeForm({ assets = [], onExchange }) {
  const activeSourceAssets = useMemo(
    () => assets.filter((asset) => Number(asset.amount) > 0),
    [assets],
  );

  const [sourceAssetId, setSourceAssetId] = useState("");
  const [targetAssetId, setTargetAssetId] = useState("");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("1");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const sourceAsset = useMemo(
    () => assets.find((asset) => asset.id === sourceAssetId) || null,
    [assets, sourceAssetId],
  );

  const targetAssets = useMemo(() => {
    if (!sourceAssetId) return assets;

    return assets.filter((asset) => asset.id !== sourceAssetId);
  }, [assets, sourceAssetId]);

  const targetAsset = useMemo(
    () => assets.find((asset) => asset.id === targetAssetId) || null,
    [assets, targetAssetId],
  );

  const parsedAmount = Number(amount);
  const parsedRate = Number(rate);
  const convertedAmount =
    Number.isFinite(parsedAmount) &&
    Number.isFinite(parsedRate) &&
    parsedAmount > 0 &&
    parsedRate > 0
      ? Number((parsedAmount * parsedRate).toFixed(8))
      : null;

  useEffect(() => {
    if (activeSourceAssets.length === 0) {
      setSourceAssetId("");
      setTargetAssetId("");
      return;
    }

    setSourceAssetId((currentValue) => {
      const stillExists = activeSourceAssets.some(
        (asset) => asset.id === currentValue,
      );

      return stillExists ? currentValue : activeSourceAssets[0].id;
    });
  }, [activeSourceAssets]);

  useEffect(() => {
    if (!sourceAssetId) {
      setTargetAssetId("");
      return;
    }

    const availableTargets = assets.filter(
      (asset) => asset.id !== sourceAssetId,
    );

    if (availableTargets.length === 0) {
      setTargetAssetId("");
      return;
    }

    setTargetAssetId((currentValue) => {
      const stillExists = availableTargets.some(
        (asset) => asset.id === currentValue,
      );

      return stillExists ? currentValue : availableTargets[0].id;
    });
  }, [assets, sourceAssetId]);

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

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const didExchange = await onExchange({
        sourceAssetId,
        targetAssetId,
        amount: parsedAmount,
        rate: parsedRate,
        note: note.trim(),
      });

      if (!didExchange) {
        showMessage("error", "Could not exchange assets.");
        return;
      }

      setAmount("");
      setRate("1");
      setNote("");
      showMessage("success", "Exchange completed successfully.");
    } catch (error) {
      showMessage("error", "Something went wrong while exchanging.");
    }
  }

  const canExchange =
    sourceAssetId &&
    targetAssetId &&
    sourceAssetId !== targetAssetId &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    Number.isFinite(parsedRate) &&
    parsedRate > 0 &&
    convertedAmount !== null &&
    convertedAmount > 0;

  const previewText =
    sourceAsset && targetAsset && convertedAmount !== null
      ? `You will move ${formatAmount(parsedAmount)} ${sourceAsset.unit} from ${sourceAsset.name} into ${formatAmount(convertedAmount)} ${targetAsset.unit} for ${targetAsset.name}.`
      : "Choose two assets and enter an exchange rate to preview the result.";

  return (
    <form onSubmit={handleSubmit} className="goal-form-card asset-form-card">
      <div className="goal-form-header">
        <div>
          <h2>Exchange Assets</h2>
          <p>Move value from one asset into another using your own rate.</p>
        </div>
      </div>

      {message ? <div className={`form-message ${messageType}`}>{message}</div> : null}

      <div className="goal-form-grid">
        <div className="field-group">
          <label>Source Asset</label>
          <select
            value={sourceAssetId}
            onChange={(e) => setSourceAssetId(e.target.value)}
            disabled={activeSourceAssets.length === 0}
          >
            {activeSourceAssets.length === 0 ? (
              <option value="">No assets with balance</option>
            ) : (
              activeSourceAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({formatAmount(Number(asset.amount))} {asset.unit})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="field-group">
          <label>Target Asset</label>
          <select
            value={targetAssetId}
            onChange={(e) => setTargetAssetId(e.target.value)}
            disabled={targetAssets.length === 0}
          >
            {targetAssets.length === 0 ? (
              <option value="">No target asset available</option>
            ) : (
              targetAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({formatAmount(Number(asset.amount))} {asset.unit})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="field-group">
          <label>Amount to Exchange</label>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Exchange Rate</label>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="1.00"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>

        <div className="field-group full exchange-preview">
          <label>Preview</label>
          <p className="muted">{previewText}</p>
        </div>

        <div className="field-group full asset-form-note">
          <label>Note</label>
          <input
            type="text"
            placeholder="Optional exchange note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        className="primary-btn asset-save-btn"
        disabled={!canExchange || activeSourceAssets.length === 0}
      >
        Exchange Assets
      </button>
    </form>
  );
}
