export type ProductType = "A" | "GNY" | "C" | "K";

export type OrderStatus = "Entregado" | "Entregado + P" | "Entregado + TRF";

export interface Product {
  type: ProductType;
  quantity: number;
}

export interface Order {
  id: string;
  gymName: string;
  products: Product[];
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updatedOrder: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  clearOrders: () => void;
}
