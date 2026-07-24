export type ProductType = "A" | "GNY" | "C" | "K";

export type OrderStatus = "Entregado" | "Entregado + P" | "Entregado + TRF";

export interface Product {
  type: ProductType;
  quantity: number;
}

export interface Gasto {
  id: string;
  name: string;
  price: number;
  createdAt: string;
}

export interface Order {
  id: string;
  gymName: string;
  products: Product[];
  status: OrderStatus;
  notes?: string;
  price?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockItem {
  id: string;
  name: string;
  type: ProductType;
  quantity: number;
  minThreshold: number;
  price: number;
  updatedAt: string;
  lastAdjustmentReason: string;
}

export interface InventoryStore {
  items: StockItem[];
  hydrated: boolean;
  addItem: (input: Omit<StockItem, "id" | "updatedAt" | "lastAdjustmentReason">) => void;
  updateItem: (id: string, patch: Partial<StockItem>) => void;
  deleteItem: (id: string) => void;
  clearInventory: () => void;
  consumeProducts: (
    products: Product[],
    reason?: string
  ) => { ok: true } | { ok: false; reason: string; shortfall?: Partial<Record<ProductType, number>> };
  restoreProducts: (
    products: Product[],
    reason?: string
  ) => { ok: true };
  checkAvailability: (
    products: Product[]
  ) => { available: true } | { available: false; shortfall: Partial<Record<ProductType, number>> };
  importItems: (rows: ImportRow[]) => ImportResult[];
  exportItems: () => Promise<void>;
}

export interface ImportRow {
  name: string;
  type: ProductType;
  quantity: number;
  minThreshold: number;
  price: number;
}

export interface ImportResult {
  row: number;
  status: "ok" | "error";
  error?: string;
}

export type OrderResult = { ok: true } | { ok: false; reason: string; shortfall?: Partial<Record<ProductType, number>> };

export interface OrderStore {
  orders: Order[];
  gastos: Gasto[];
  lastUpdated: number;
  addOrder: (order: Order) => OrderResult;
  updateOrder: (id: string, updatedOrder: Partial<Order>) => OrderResult;
  deleteOrder: (id: string) => OrderResult;
  clearOrders: () => void;
  setOrders: (orders: Order[]) => void;
  getOrdersAsJSON: () => string;
  importOrdersFromJSON: (json: string) => { success: boolean; message: string };
  exportOrdersToShare: () => Promise<{ success: boolean; message: string }>;
  addGasto: (gasto: Gasto) => void;
  updateGasto: (id: string, updatedGasto: Partial<Gasto>) => void;
  deleteGasto: (id: string) => void;
  clearGastos: () => void;
}
