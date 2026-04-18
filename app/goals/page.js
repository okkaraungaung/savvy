"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AddGoalForm from "@/components/AddGoalForm";
import GoalCard from "@/components/GoalCard";
import { defaultState, loadState, saveState } from "@/lib/storage";

export default function GoalsPage() {
  const [state, setState] = useState(defaultState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const saved = loadState();
    setState(saved);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    saveState(state);
  }, [state, isReady]);

  function addGoal(goal) {
    setState((prev) => ({
      ...prev,
      goals: [...prev.goals, goal],
    }));
  }

  if (!isReady) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <main className="page-wrap">
      <div className="container">
        <div className="header">
          <div>
            <h1>Goals</h1>
            <p>Create and track your savings goals</p>
          </div>
        </div>

        <div className="page-section">
          <AddGoalForm onAddGoal={addGoal} />
        </div>

        <div className="page-section">
          <div className="goal-grid">
            {state.goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
