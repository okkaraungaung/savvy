"use client";

import { useMemo, useState } from "react";

export default function AddGoalForm({ assets = [], onAddGoal }) {
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [unit, setUnit] = useState("");
  const [deadline, setDeadline] = useState("");

  const uniqueUnits = useMemo(() => {
    return [...new Set(assets.map((asset) => asset.unit).filter(Boolean))];
  }, [assets]);

  function handleSubmit(e) {
    e.preventDefault();

    const parsedTarget = Number(target);
    const parsedCurrent = Number(current);
    const normalizedCurrent =
      Number.isNaN(parsedCurrent) || parsedCurrent < 0 ? 0 : parsedCurrent;

    if (
      !title.trim() ||
      !unit.trim() ||
      Number.isNaN(parsedTarget) ||
      parsedTarget <= 0
    ) {
      return;
    }

    onAddGoal({
      title: title.trim(),
      target: parsedTarget,
      current: normalizedCurrent,
      unit: unit.trim(),
      deadline,
    });

    setTitle("");
    setTarget("");
    setCurrent("");
    setUnit("");
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

        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="">Select unit</option>
          {uniqueUnits.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>

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
