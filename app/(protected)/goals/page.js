"use client";

import { useEffect, useState } from "react";
import AddGoalForm from "@/components/AddGoalForm";
import GoalCard from "@/components/GoalCard";
import { createClient } from "@/lib/supabase/client";
import { getCurrentScope } from "@/lib/getCurrentScope";

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function fetchGoalsAndAssets() {
    setLoading(true);
    setError("");

    const { user, currentGroupId } = await getCurrentScope();

    if (!user) {
      setError("User not found");
      setLoading(false);
      return;
    }

    let goalsQuery = supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false });

    let assetsQuery = supabase
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false });

    if (currentGroupId) {
      goalsQuery = goalsQuery.eq("group_id", currentGroupId);
      assetsQuery = assetsQuery.eq("group_id", currentGroupId);
    } else {
      goalsQuery = goalsQuery.eq("user_id", user.id).is("group_id", null);
      assetsQuery = assetsQuery.eq("user_id", user.id).is("group_id", null);
    }

    const [
      { data: goalsData, error: goalsError },
      { data: assetsData, error: assetsError },
    ] = await Promise.all([goalsQuery, assetsQuery]);

    if (goalsError) {
      setError(goalsError.message);
      setLoading(false);
      return;
    }

    if (assetsError) {
      setError(assetsError.message);
      setLoading(false);
      return;
    }

    setGoals(goalsData || []);
    setAssets(assetsData || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchGoalsAndAssets();
  }, []);

  async function addGoal(newGoal) {
    setError("");

    const { user, currentGroupId } = await getCurrentScope();

    if (!user) {
      setError("User not found");
      return;
    }

    const { data, error } = await supabase
      .from("goals")
      .insert([
        {
          ...newGoal,
          user_id: currentGroupId ? null : user.id,
          group_id: currentGroupId || null,
        },
      ])
      .select();

    if (error) {
      setError(error.message);
      return;
    }

    setGoals((prev) => [...(data || []), ...prev]);
  }

  if (loading) {
    return <div className="loading">Loading goals...</div>;
  }

  return (
    <main className="page-wrap">
      <div className="container">
        <div className="header">
          <div>
            <h1>Goals</h1>
            <p>Create and track your savings goals.</p>
          </div>
        </div>

        {error ? (
          <div className="card">
            <p className="muted">Error: {error}</p>
          </div>
        ) : null}

        <div className="page-section">
          <AddGoalForm assets={assets} onAddGoal={addGoal} />
        </div>

        <div className="page-section">
          <div className="section-head">
            <h2>Your Goals</h2>
          </div>

          {goals.length === 0 ? (
            <div className="card">
              <p className="muted">No goals yet.</p>
            </div>
          ) : (
            <div className="goal-grid">
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
