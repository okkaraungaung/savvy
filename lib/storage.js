const STORAGE_KEY = "shared-savings-app";

const defaultAssets = [
  {
    id: crypto.randomUUID(),
    category: "currency",
    name: "USD",
    amount: 0,
    unit: "USD",
  },
  {
    id: crypto.randomUUID(),
    category: "metal",
    name: "Gold",
    amount: 0,
    unit: "gram",
  },
  {
    id: crypto.randomUUID(),
    category: "metal",
    name: "Silver",
    amount: 0,
    unit: "gram",
  },
  {
    id: crypto.randomUUID(),
    category: "crypto",
    name: "Bitcoin",
    amount: 0,
    unit: "BTC",
  },
];

export const defaultState = {
  assets: defaultAssets,
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
