const STORAGE_KEY = "shared-savings-app";

export const defaultState = {
  assets: [
    {
      id: "1",
      type: "cash",
      name: "Cash Savings",
      amount: 15000,
      unit: "THB",
      note: "Emergency fund",
    },
    {
      id: "2",
      type: "gold",
      name: "Gold",
      amount: 2,
      unit: "baht-weight",
      note: "Physical gold",
    },
    {
      id: "3",
      type: "crypto",
      name: "Bitcoin",
      amount: 0.05,
      unit: "BTC",
      note: "Long-term hold",
    },
  ],
  transactions: [
    {
      id: "1",
      assetType: "cash",
      assetName: "Cash Savings",
      type: "deposit",
      amount: 5000,
      unit: "THB",
      date: new Date().toISOString(),
      note: "Monthly savings",
    },
  ],
  goals: [
    {
      id: "1",
      title: "Emergency Fund",
      target: 50000,
      current: 15000,
      unit: "THB",
      assetType: "cash",
      deadline: "2026-12-31",
    },
  ],
};

export function loadState() {
  if (typeof window === "undefined") return defaultState;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState;

  try {
    return JSON.parse(raw);
  } catch {
    return defaultState;
  }
}

export function saveState(state) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
