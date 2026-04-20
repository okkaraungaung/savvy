"use client";

import { useEffect, useState } from "react";
import AddAssetForm from "@/components/AddAssetForm";
import AssetCard from "@/components/AssetCard";
import { createClient } from "@/lib/supabase/client";

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function fetchAssets() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false });

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

    const { data, error } = await supabase
      .from("assets")
      .insert([newAsset])
      .select();

    if (error) {
      setError(error.message);
      return;
    }

    setAssets((prev) => [...(data || []), ...prev]);
  }

  const activeAssets = assets.filter((a) => Number(a.amount) > 0);

  if (loading) {
    return <div className="loading">Loading assets...</div>;
  }

  return (
    <main className="page-wrap">
      <div className="container">
        <div className="header">
          <div>
            <h1>All Assets</h1>
            <p>View all your assets and add new ones here.</p>
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
