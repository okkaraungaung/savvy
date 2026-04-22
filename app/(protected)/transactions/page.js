"use client";

import { useEffect, useState } from "react";
import AddTransactionForm from "@/components/AddTransactionForm";
import TransactionList from "@/components/TransactionList";
import { createClient } from "@/lib/supabase/client";
import { getCurrentScope } from "@/lib/getCurrentScope";

export default function TransactionsPage() {
  const [assets, setAssets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function fetchData() {
    setLoading(true);
    setError("");

    const { user, currentGroupId } = await getCurrentScope();

    if (!user) {
      setError("User not found");
      setLoading(false);
      return;
    }

    let assetsQuery = supabase
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false });

    let goalsQuery = supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false });

    let transactionsQuery = supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: true });

    if (currentGroupId) {
      assetsQuery = assetsQuery.eq("group_id", currentGroupId);
      goalsQuery = goalsQuery.eq("group_id", currentGroupId);
      transactionsQuery = transactionsQuery.eq("group_id", currentGroupId);
    } else {
      assetsQuery = assetsQuery.eq("user_id", user.id).is("group_id", null);
      goalsQuery = goalsQuery.eq("user_id", user.id).is("group_id", null);
      transactionsQuery = transactionsQuery
        .eq("user_id", user.id)
        .is("group_id", null);
    }

    const [
      { data: assetsData, error: assetsError },
      { data: goalsData, error: goalsError },
      { data: transactionsData, error: transactionsError },
    ] = await Promise.all([assetsQuery, goalsQuery, transactionsQuery]);

    if (assetsError) {
      setError(assetsError.message);
      setLoading(false);
      return;
    }

    if (goalsError) {
      setError(goalsError.message);
      setLoading(false);
      return;
    }

    if (transactionsError) {
      setError(transactionsError.message);
      setLoading(false);
      return;
    }

    setAssets(assetsData || []);
    setGoals(goalsData || []);
    setTransactions(transactionsData || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function addTransaction(tx) {
    setError("");

    const { user, currentGroupId } = await getCurrentScope();

    if (!user) {
      setError("User not found");
      return;
    }

    const existingAsset = assets.find(
      (asset) =>
        asset.category === tx.assetCategory &&
        asset.name.toLowerCase() === tx.assetName.toLowerCase(),
    );

    if (!existingAsset) {
      setError("Asset not found.");
      return;
    }

    if (tx.type === "withdraw" && Number(existingAsset.amount) < tx.amount) {
      setError("Not enough asset balance.");
      return;
    }

    const selectedGoal = tx.goalId
      ? goals.find((goal) => goal.id === tx.goalId)
      : null;

    if (
      selectedGoal &&
      tx.type === "withdraw" &&
      Number(selectedGoal.current) < tx.amount
    ) {
      setError("Not enough goal balance.");
      return;
    }

    const rawAssetAmount =
      tx.type === "deposit"
        ? Number(existingAsset.amount) + tx.amount
        : Number(existingAsset.amount) - tx.amount;

    const nextAssetAmount = Number(rawAssetAmount.toFixed(8));

    let assetUpdateQuery = supabase
      .from("assets")
      .update({ amount: nextAssetAmount })
      .eq("id", existingAsset.id);

    if (currentGroupId) {
      assetUpdateQuery = assetUpdateQuery.eq("group_id", currentGroupId);
    } else {
      assetUpdateQuery = assetUpdateQuery
        .eq("user_id", user.id)
        .is("group_id", null);
    }

    const { error: assetUpdateError } = await assetUpdateQuery;

    if (assetUpdateError) {
      setError(assetUpdateError.message);
      return;
    }

    let nextGoalCurrent = null;

    if (selectedGoal) {
      const rawGoalCurrent =
        tx.type === "deposit"
          ? Number(selectedGoal.current) + tx.amount
          : Number(selectedGoal.current) - tx.amount;

      nextGoalCurrent = Number(rawGoalCurrent.toFixed(8));

      let goalUpdateQuery = supabase
        .from("goals")
        .update({ current: nextGoalCurrent })
        .eq("id", selectedGoal.id);

      if (currentGroupId) {
        goalUpdateQuery = goalUpdateQuery.eq("group_id", currentGroupId);
      } else {
        goalUpdateQuery = goalUpdateQuery
          .eq("user_id", user.id)
          .is("group_id", null);
      }

      const { error: goalUpdateError } = await goalUpdateQuery;

      if (goalUpdateError) {
        setError(goalUpdateError.message);
        return;
      }
    }

    const { data, error: insertError } = await supabase
      .from("transactions")
      .insert([
        {
          asset_id: existingAsset.id,
          asset_name: tx.assetName,
          asset_category: tx.assetCategory,
          type: tx.type,
          amount: tx.amount,
          unit: tx.unit,
          note: tx.note,
          goal_id: tx.goalId || null,
          user_id: currentGroupId ? null : user.id,
          group_id: currentGroupId || null,
        },
      ])
      .select();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === existingAsset.id
          ? { ...asset, amount: nextAssetAmount }
          : asset,
      ),
    );

    if (selectedGoal && nextGoalCurrent !== null) {
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === selectedGoal.id
            ? { ...goal, current: nextGoalCurrent }
            : goal,
        ),
      );
    }

    setTransactions((prev) => [...(data || []), ...prev]);
  }

  if (loading) {
    return <div className="loading">Loading transactions...</div>;
  }

  return (
    <main className="page-wrap">
      <div className="container">
        <div className="header">
          <div>
            <h1>Transactions</h1>
            <p>Add and view your transactions here.</p>
          </div>
        </div>

        {error ? (
          <div className="card">
            <p className="muted">Error: {error}</p>
          </div>
        ) : null}

        <div className="page-section">
          <AddTransactionForm
            assets={assets}
            goals={goals}
            onAddTransaction={addTransaction}
          />
        </div>

        <div className="page-section">
          <TransactionList transactions={transactions} />
        </div>
      </div>
    </main>
  );
}
