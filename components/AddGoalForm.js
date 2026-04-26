"use client";

import { useMemo, useState, useEffect } from "react";

export default function AddGoalForm({ assets = [], onAddGoal }) {
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [unit, setUnit] = useState("");
  const [deadline, setDeadline] = useState("");

  // ✅ NEW
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | error

  const uniqueUnits = useMemo(() => {
    return [...new Set(assets.map((asset) => asset.unit).filter(Boolean))];
  }, [assets]);

  // ✅ auto-hide message (same as transaction form)
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

    const parsedTarget = Number(target);
    const parsedCurrent = Number(current);
    const normalizedCurrent =
      Number.isNaN(parsedCurrent) || parsedCurrent < 0 ? 0 : parsedCurrent;

    // ✅ validation messages
    if (!title.trim()) {
      showMessage("error", "Please enter goal title.");
      return;
    }

    if (!unit.trim()) {
      showMessage("error", "Please select a unit.");
      return;
    }

    if (Number.isNaN(parsedTarget) || parsedTarget <= 0) {
      showMessage("error", "Target must be greater than 0.");
      return;
    }

    try {
      onAddGoal({
        title: title.trim(),
        target: parsedTarget,
        current: normalizedCurrent,
        unit: unit.trim(),
        deadline,
      });

      // reset
      setTitle("");
      setTarget("");
      setCurrent("");
      setUnit("");
      setDeadline("");

      // ✅ success message
      showMessage("success", "Goal added successfully!");
    } catch (err) {
      showMessage("error", "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="goal-form-card">
      <div className="goal-form-header">
        <div>
          <h2>Create Goal</h2>
          <p>Set a target and track your progress easily.</p>
        </div>
      </div>

      {message && (
        <div className={`form-message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="goal-form-grid">
        <div className="field-group full">
          <label>Goal Title</label>
          <input
            type="text"
            placeholder="Example: Save for laptop"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Target Amount</label>
          <input
            type="number"
            step="any"
            placeholder="1000"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Current Amount</label>
          <input
            type="number"
            step="any"
            placeholder="0"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Unit</label>
          <select value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="">Select unit</option>
            {uniqueUnits.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label>Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
      </div>

      <button type="submit" className="goal-submit-btn">
        Add Goal
      </button>
    </form>
  );
}