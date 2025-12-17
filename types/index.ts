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

export interface OrderStore {
  orders: Order[];
  gastos: Gasto[];
  lastUpdated: number;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updatedOrder: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
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
