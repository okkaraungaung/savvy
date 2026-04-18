const STORAGE_KEY = "shared-savings-app";

export const defaultState = {
  assets: [
    {
      id: "1",
      category: "currency",
      name: "Dollar",
      amount: 0,
      unit: "USD",
      note: "Default currency asset",
    },
    {
      id: "2",
      category: "gold",
      name: "Gold",
      amount: 0,
      unit: "oz",
      note: "Default precious metal asset",
    },
    {
      id: "3",
      category: "crypto",
      name: "Bitcoin",
      amount: 0,
      unit: "BTC",
      note: "Default crypto asset",
    },
  ],
  transactions: [],
  goals: [],
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
