"use client";

import { useEffect, useState } from "react";
import AddAssetForm from "@/components/AddAssetForm";
import AssetExchangeForm from "@/components/AssetExchangeForm";
import AssetCard from "@/components/AssetCard";
import { createClient } from "@/lib/supabase/client";
import { getCurrentScope } from "@/lib/getCurrentScope";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

function applyAssetScope(query, { user, currentGroupId }) {
  if (currentGroupId) {
    return query.eq("group_id", currentGroupId);
  }

  return query.eq("user_id", user.id).is("group_id", null);
}

function formatAmount(value) {
  return Number(value.toFixed(8)).toString();
}

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function fetchAssets() {
    setLoading(true);
    setError("");

    const { user, currentGroupId } = await getCurrentScope();

    if (!user) {
      setError("User not found");
      setLoading(false);
      return;
    }

    let query = supabase
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false });

    if (currentGroupId) {
      query = query.eq("group_id", currentGroupId);
    } else {
      query = query.eq("user_id", user.id).is("group_id", null);
    }

    const { data, error } = await query;

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setAssets(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchAssets();
  }, []);

  async function addAsset(newAsset) {
    setError("");

    const { user, currentGroupId } = await getCurrentScope();

    if (!user) {
      setError("User not found");
      return;
    }

    const assetPayload = {
      ...newAsset,
      user_id: user.id,
      group_id: currentGroupId || null,
    };

    const { data, error } = await supabase
      .from("assets")
      .insert([assetPayload])
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    setAssets((prev) => [data, ...prev]);

    if (Number(data.amount) > 0) {
      const { error: txError } = await supabase.from("transactions").insert([
        {
          asset_id: data.id,
          asset_name: data.name,
          asset_category: data.category,
          type: "deposit",
          amount: data.amount,
          unit: data.unit,
          note: "Initial balance",
          user_id: user.id,
          group_id: currentGroupId || null,
        },
      ]);

      if (txError) {
        setError(txError.message);
      }
    }
  }

  async function exchangeAssets({
    sourceAssetId,
    targetAssetId,
    amount,
    rate,
    note,
  }) {
    setError("");

    try {
      const { user, currentGroupId } = await getCurrentScope();

      if (!user) {
        setError("User not found");
        return false;
      }

      if (sourceAssetId === targetAssetId) {
        setError("Please choose two different assets.");
        return false;
      }

      const sourceAsset = assets.find((asset) => asset.id === sourceAssetId);
      const targetAsset = assets.find((asset) => asset.id === targetAssetId);

      if (!sourceAsset || !targetAsset) {
        setError("Selected asset not found.");
        return false;
      }

      const sourceAmount = Number(amount);
      const exchangeRate = Number(rate);

      if (Number.isNaN(sourceAmount) || sourceAmount <= 0) {
        setError("Enter a valid amount to exchange.");
        return false;
      }

      if (Number.isNaN(exchangeRate) || exchangeRate <= 0) {
        setError("Enter a valid exchange rate.");
        return false;
      }

      const sourceBalance = Number(sourceAsset.amount);
      if (sourceBalance < sourceAmount) {
        setError("Not enough balance in the source asset.");
        return false;
      }

      const targetIncrease = Number((sourceAmount * exchangeRate).toFixed(8));
      if (targetIncrease <= 0) {
        setError("Exchange amount is too small for the selected rate.");
        return false;
      }

      const nextSourceAmount = Number((sourceBalance - sourceAmount).toFixed(8));
      const nextTargetAmount = Number(
        (Number(targetAsset.amount) + targetIncrease).toFixed(8),
      );

      let sourceUpdateQuery = supabase
        .from("assets")
        .update({ amount: nextSourceAmount })
        .eq("id", sourceAsset.id);

      let targetUpdateQuery = supabase
        .from("assets")
        .update({ amount: nextTargetAmount })
        .eq("id", targetAsset.id);

      sourceUpdateQuery = applyAssetScope(sourceUpdateQuery, {
        user,
        currentGroupId,
      });
      targetUpdateQuery = applyAssetScope(targetUpdateQuery, {
        user,
        currentGroupId,
      });

      const { error: sourceUpdateError } = await sourceUpdateQuery;

      if (sourceUpdateError) {
        setError(sourceUpdateError.message);
        return false;
      }

      const { error: targetUpdateError } = await targetUpdateQuery;

      if (targetUpdateError) {
        const revertSourceQuery = applyAssetScope(
          supabase
            .from("assets")
            .update({ amount: sourceAsset.amount })
            .eq("id", sourceAsset.id),
          { user, currentGroupId },
        );

        await revertSourceQuery;
        setError(targetUpdateError.message);
        return false;
      }

      const exchangeSummary = `Exchange: ${formatAmount(
        sourceAmount,
      )} ${sourceAsset.unit} -> ${formatAmount(
        targetIncrease,
      )} ${targetAsset.unit} at ${formatAmount(exchangeRate)} ${targetAsset.unit}/${sourceAsset.unit}`;

      const exchangeNote = note
        ? `${note} · ${exchangeSummary}`
        : exchangeSummary;

      const { error: transactionError } = await supabase
        .from("transactions")
        .insert([
          {
            asset_id: sourceAsset.id,
            asset_name: sourceAsset.name,
            asset_category: sourceAsset.category,
            type: "withdraw",
            amount: sourceAmount,
            unit: sourceAsset.unit,
            note: `${exchangeNote} (source)`,
            user_id: user.id,
            group_id: currentGroupId || null,
          },
          {
            asset_id: targetAsset.id,
            asset_name: targetAsset.name,
            asset_category: targetAsset.category,
            type: "deposit",
            amount: targetIncrease,
            unit: targetAsset.unit,
            note: `${exchangeNote} (target)`,
            user_id: user.id,
            group_id: currentGroupId || null,
          },
        ]);

      if (transactionError) {
        const revertSourceQuery = applyAssetScope(
          supabase
            .from("assets")
            .update({ amount: sourceAsset.amount })
            .eq("id", sourceAsset.id),
          { user, currentGroupId },
        );
        const revertTargetQuery = applyAssetScope(
          supabase
            .from("assets")
            .update({ amount: targetAsset.amount })
            .eq("id", targetAsset.id),
          { user, currentGroupId },
        );

        await Promise.all([revertSourceQuery, revertTargetQuery]);
        setError(transactionError.message);
        return false;
      }

      setAssets((prev) =>
        prev.map((asset) => {
          if (asset.id === sourceAsset.id) {
            return { ...asset, amount: nextSourceAmount };
          }

          if (asset.id === targetAsset.id) {
            return { ...asset, amount: nextTargetAmount };
          }

          return asset;
        }),
      );

      return true;
    } catch (error) {
      setError(error.message || "Something went wrong while exchanging assets.");
      return false;
    }
  }

  const activeAssets = assets.filter((a) => Number(a.amount) > 0);

  if (loading) {
    return <div className="loading">Loading assets...</div>;
  }

  return (
    <main className="page-wrap">
      <div className="container">
        <div className="header header-with-back">
          <div className="header-left">
            <button
              type="button"
              className="back-btn-inline"
              onClick={() => router.push("/")}
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1>All Assets</h1>
              <p>View all your assets and add new ones here.</p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="card">
            <p className="muted">Error: {error}</p>
          </div>
        ) : null}

        <div className="page-section">
          <AddAssetForm onAddAsset={addAsset} />
        </div>

        <div className="page-section">
          <AssetExchangeForm assets={assets} onExchange={exchangeAssets} />
        </div>

        <div className="page-section">
          <div className="section-head">
            <h2>Your Assets</h2>
          </div>

          {activeAssets.length === 0 ? (
            <div className="card">
              <p className="muted">No assets yet.</p>
            </div>
          ) : (
            <div className="asset-grid">
              {activeAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
