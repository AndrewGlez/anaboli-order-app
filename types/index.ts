export type ProductType = "A" | "GNY" | "C" | "K";

// Distribution matrix types
export type DateKey = `${number}-${number}-${number}`;

export interface Gym {
	id: string;
	name: string;
	active: boolean;
	createdAt: string;
	updatedAt: string;
}

export type GymInput = Omit<Gym, "id" | "createdAt" | "updatedAt">;
export type GymPatch = Partial<Omit<Gym, "id" | "createdAt">>;

export type MutationResult = { ok: true } | { ok: false; reason: string };

export interface GymStore {
	gyms: Gym[];
	hydrated: boolean;
	addGym: (
		input: GymInput,
	) => { ok: true; id: string } | { ok: false; reason: string };
	updateGym: (id: string, patch: GymPatch) => MutationResult;
	toggleGymActive: (id: string) => MutationResult;
	deleteGym: (id: string) => MutationResult;
	getActiveGyms: () => Gym[];
	getGymById: (id: string) => Gym | undefined;
	getGymByName: (name: string) => Gym | undefined;
}

export interface CellKey {
	gymId: string;
	flavor: FlavorCode;
	productType: ProductType;
	date: DateKey;
}

export type CellValues = Record<ProductType, number>;

export interface DistributionMatrixModel {
	date: DateKey;
	gyms: Gym[];
	rows: {
		flavor: FlavorCode;
		values: Record<string, CellValues>;
		total: CellValues;
	}[];
	gymTotals: Record<string, CellValues>;
	grandTotal: number;
}

export interface StockWarning {
	productType: ProductType;
	requested: number;
	available: number;
	shortfall: number;
}

export interface CellEditContext extends CellKey {
	newValue: number;
	currentValue: number;
}

export interface CellEditResult {
	ok: boolean;
	value: number;
	diff: number;
	warning?: StockWarning;
	reason?: string;
}

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

// Flavor codes from production catalog
export type FlavorCode =
	| "Apple Pie"
	| "Berry Lover"
	| "Maracuyá Citrus"
	| "Higo Toffee"
	| "Piña Coconut"
	| "Maní Crunch"
	| "Expreso Coffee"
	| "Choco Power"
	| "Banana Coffee"
	| "Choco Nuts"
	| "Choco Menta";

export interface Order {
	id: string;
	gymId: string;
	gymName: string; // immutable creation-time snapshot
	products: Product[];
	status: OrderStatus;
	notes?: string;
	price?: number;
	createdAt: string;
	updatedAt: string;
	flavor: FlavorCode;
}

// Legacy order type for migration - orders with missing or invalid flavors
export interface LegacyOrder {
	order: Omit<Order, "flavor">;
	legacyFlavor: unknown;
	legacyReason: "missing" | "invalid";
}

// Raw persisted order from storage (before hydration)
export type RawPersistedOrder = Omit<Order, "flavor" | "gymId"> & {
	flavor?: unknown | null;
	gymId?: string;
};

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
	addItem: (
		input: Omit<StockItem, "id" | "updatedAt" | "lastAdjustmentReason">,
	) => void;
	updateItem: (id: string, patch: Partial<StockItem>) => void;
	deleteItem: (id: string) => void;
	clearInventory: () => void;
	consumeProducts: (
		products: Product[],
		reason?: string,
	) =>
		| { ok: true }
		| {
				ok: false;
				reason: string;
				shortfall?: Partial<Record<ProductType, number>>;
		  };
	restoreProducts: (products: Product[], reason?: string) => { ok: true };
	checkAvailability: (
		products: Product[],
	) =>
		| { available: true }
		| { available: false; shortfall: Partial<Record<ProductType, number>> };
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

export type OrderResult =
	| { ok: true }
	| {
			ok: false;
			reason: string;
			shortfall?: Partial<Record<ProductType, number>>;
	  };

export type OrderResultWithWarning =
	| { ok: true; warning?: StockWarning }
	| {
			ok: false;
			reason: string;
			shortfall?: Partial<Record<ProductType, number>>;
	  };

export interface OrderStore {
	orders: Order[];
	gastos: Gasto[];
	lastUpdated: number;
	addOrder: (order: Order) => OrderResult;
	addOrderDistributable: (order: Order) => OrderResultWithWarning;
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
	// Flavor validation methods
	hydrateOrder: (raw: RawPersistedOrder) => Order | LegacyOrder;
	validateFlavor: (flavor: unknown) => FlavorCode;
	fixOrderFlavor: (
		id: string,
		flavor: FlavorCode,
	) => { ok: true } | { ok: false; reason: string };
}
