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

  function applyScope(query, { user, currentGroupId }) {
    if (currentGroupId) {
      return query.eq("group_id", currentGroupId);
    }

    return query.eq("user_id", user.id).is("group_id", null);
  }

  async function addGoal(newGoal) {
    setError("");

    const { user, currentGroupId } = await getCurrentScope();

    if (!user) {
      setError("User not found");
      return;
    }

    const startingAmount = Number(newGoal.current) || 0;
    const selectedAsset =
      startingAmount > 0
        ? assets.find(
            (asset) =>
              asset.unit &&
              asset.unit.toLowerCase() === newGoal.unit.toLowerCase(),
          ) || null
        : null;

    if (
      selectedAsset &&
      selectedAsset.unit &&
      selectedAsset.unit.toLowerCase() !== newGoal.unit.toLowerCase()
    ) {
      setError("Selected asset unit does not match the goal unit.");
      return;
    }

    const goalPayload = {
      ...newGoal,
      deadline: newGoal.deadline ? newGoal.deadline : null,
      user_id: user.id,
      group_id: currentGroupId || null,
    };

    const { data, error } = await supabase
      .from("goals")
      .insert([goalPayload])
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    if (selectedAsset && startingAmount > 0) {
      const rollbackGoalInsert = async () => {
        let deleteGoalQuery = supabase.from("goals").delete().eq("id", data.id);

        if (currentGroupId) {
          deleteGoalQuery = deleteGoalQuery.eq("group_id", currentGroupId);
        } else {
          deleteGoalQuery = deleteGoalQuery
            .eq("user_id", user.id)
            .is("group_id", null);
        }

        await deleteGoalQuery;
      };

      const nextAssetAmount = Number(
        (Number(selectedAsset.amount) + startingAmount).toFixed(8),
      );

      let assetUpdateQuery = supabase
        .from("assets")
        .update({ amount: nextAssetAmount })
        .eq("id", selectedAsset.id);

      if (currentGroupId) {
        assetUpdateQuery = assetUpdateQuery.eq("group_id", currentGroupId);
      } else {
        assetUpdateQuery = assetUpdateQuery
          .eq("user_id", user.id)
          .is("group_id", null);
      }

      const { error: assetUpdateError } = await assetUpdateQuery;

      if (assetUpdateError) {
        await rollbackGoalInsert();
        setError(assetUpdateError.message);
        return;
      }

      const { error: txError } = await supabase.from("transactions").insert([
        {
          asset_id: selectedAsset.id,
          asset_name: selectedAsset.name,
          asset_category: selectedAsset.category,
          type: "deposit",
          amount: startingAmount,
          unit: newGoal.unit,
          note: `Initial goal amount for ${newGoal.title}`,
          goal_id: data.id,
          user_id: user.id,
          group_id: currentGroupId || null,
        },
      ]);

      if (txError) {
        let revertAssetQuery = supabase
          .from("assets")
          .update({ amount: selectedAsset.amount })
          .eq("id", selectedAsset.id);

        if (currentGroupId) {
          revertAssetQuery = revertAssetQuery.eq("group_id", currentGroupId);
        } else {
          revertAssetQuery = revertAssetQuery
            .eq("user_id", user.id)
            .is("group_id", null);
        }

        await revertAssetQuery;
        await rollbackGoalInsert();
        setError(txError.message);
        return;
      }

      setAssets((prev) =>
        prev.map((asset) =>
          asset.id === selectedAsset.id
            ? { ...asset, amount: nextAssetAmount }
            : asset,
        ),
      );
    }

    if (startingAmount > 0 && !selectedAsset) {
      setError(
        `Goal created, but no matching asset with unit ${newGoal.unit} was found.`,
      );
    }

    setGoals((prev) => [data, ...prev]);
  }

  async function cancelGoal(goalId) {
    setError("");

    const { user, currentGroupId } = await getCurrentScope();

    if (!user) {
      setError("User not found");
      return;
    }

    let deleteGoalQuery = supabase.from("goals").delete().eq("id", goalId);
    deleteGoalQuery = applyScope(deleteGoalQuery, { user, currentGroupId });

    const { error: deleteError } = await deleteGoalQuery;

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
  }

  async function useGoal(goal) {
    setError("");

    const { user, currentGroupId } = await getCurrentScope();

    if (!user) {
      setError("User not found");
      return;
    }

    const amountToUse = Number(goal.current) || 0;

    if (amountToUse <= 0) {
      setError("Goal target amount is invalid.");
      return;
    }

    const selectedAsset =
      assets.find(
        (asset) =>
          asset.unit &&
          asset.unit.toLowerCase() === goal.unit?.toLowerCase() &&
          Number(asset.amount) >= amountToUse,
      ) || null;

    if (!selectedAsset) {
      setError(`No asset with enough ${goal.unit} balance was found.`);
      return;
    }

    const nextAssetAmount = Number(
      (Number(selectedAsset.amount) - amountToUse).toFixed(8),
    );

    let assetUpdateQuery = supabase
      .from("assets")
      .update({ amount: nextAssetAmount })
      .eq("id", selectedAsset.id);

    assetUpdateQuery = applyScope(assetUpdateQuery, { user, currentGroupId });

    const { error: assetUpdateError } = await assetUpdateQuery;

    if (assetUpdateError) {
      setError(assetUpdateError.message);
      return;
    }

    const { error: txError } = await supabase.from("transactions").insert([
      {
        asset_id: selectedAsset.id,
        asset_name: selectedAsset.name,
        asset_category: selectedAsset.category,
        type: "withdraw",
        amount: amountToUse,
        unit: goal.unit,
        note: `Used goal: ${goal.title}`,
        goal_id: goal.id,
        user_id: user.id,
        group_id: currentGroupId || null,
      },
    ]);

    if (txError) {
      let revertAssetQuery = supabase
        .from("assets")
        .update({ amount: selectedAsset.amount })
        .eq("id", selectedAsset.id);

      revertAssetQuery = applyScope(revertAssetQuery, { user, currentGroupId });
      await revertAssetQuery;
      setError(txError.message);
      return;
    }

    let deleteGoalQuery = supabase.from("goals").delete().eq("id", goal.id);
    deleteGoalQuery = applyScope(deleteGoalQuery, { user, currentGroupId });

    const { error: deleteGoalError } = await deleteGoalQuery;

    if (deleteGoalError) {
      let revertAssetQuery = supabase
        .from("assets")
        .update({ amount: selectedAsset.amount })
        .eq("id", selectedAsset.id);

      revertAssetQuery = applyScope(revertAssetQuery, { user, currentGroupId });
      await revertAssetQuery;

      let deleteTxQuery = supabase
        .from("transactions")
        .delete()
        .eq("goal_id", goal.id)
        .eq("note", `Used goal: ${goal.title}`)
        .eq("amount", amountToUse)
        .eq("type", "withdraw");

      deleteTxQuery = applyScope(deleteTxQuery, { user, currentGroupId });
      await deleteTxQuery;

      setError(deleteGoalError.message);
      return;
    }

    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === selectedAsset.id
          ? { ...asset, amount: nextAssetAmount }
          : asset,
      ),
    );
    setGoals((prev) => prev.filter((item) => item.id !== goal.id));
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
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onUseGoal={useGoal}
                  onCancelGoal={cancelGoal}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
