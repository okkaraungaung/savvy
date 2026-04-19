"use client";

import { useEffect, useState } from "react";
import AddAssetForm from "@/components/AddAssetForm";
import AssetCard from "@/components/AssetCard";
import { defaultState, loadState, saveState } from "@/lib/storage";

export default function AssetsPage() {
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

  function addAsset(newAsset) {
    setState((prev) => ({
      ...prev,
      assets: [...prev.assets, newAsset],
    }));
  }

  const activeAssets = state.assets.filter((a) => a.amount > 0);

  if (!isReady) {
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
