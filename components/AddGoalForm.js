"use client";

import { useState } from "react";

export default function AddGoalForm({ onAddGoal }) {
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [unit, setUnit] = useState("THB");
  const [assetType, setAssetType] = useState("cash");
  const [deadline, setDeadline] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    const parsedTarget = Number(target);
    const parsedCurrent = Number(current);

    if (!title || !unit || Number.isNaN(parsedTarget) || parsedTarget <= 0)
      return;

    onAddGoal({
      id: crypto.randomUUID(),
      title,
      target: parsedTarget,
      current: Number.isNaN(parsedCurrent) ? 0 : parsedCurrent,
      unit,
      assetType,
      deadline,
    });

    setTitle("");
    setTarget("");
    setCurrent("");
    setDeadline("");
  }

  return (
    <form onSubmit={handleSubmit} className="card form-card">
      <h2>Create Goal</h2>

      <div className="form-grid">
        <input
          type="text"
          placeholder="Goal title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          value={assetType}
          onChange={(e) => setAssetType(e.target.value)}
        >
          <option value="cash">Cash</option>
          <option value="gold">Gold</option>
          <option value="crypto">Crypto</option>
        </select>

        <input
          type="number"
          step="any"
          placeholder="Target amount"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />

        <input
          type="number"
          step="any"
          placeholder="Current amount"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
        <input
          type="text"
          placeholder="Unit (THB, BTC, baht-weight)"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>

      <button type="submit" className="primary-btn">
        Add Goal
      </button>
    </form>
  );
}
