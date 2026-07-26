import { useProductionStore } from "@/store/productionStore";
import { FLAVOR_CODES } from "@/constants/productionCatalog";
import {
	isHistoricalVersion,
	getReadOnlyMessage,
} from "@/components/production/versionHistory";
import {
	isLegacyOrder,
	filterLegacyOrdersForDate,
	makeEligibleForReconciliation,
} from "@/components/production/legacyFixes";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
	__esModule: true,
	default: {
		getItem: jest.fn(() => Promise.resolve(null)),
		setItem: jest.fn(() => Promise.resolve()),
		removeItem: jest.fn(() => Promise.resolve()),
		clear: jest.fn(() => Promise.resolve()),
	},
}));

describe("productionStore integration with UI helpers", () => {
	beforeEach(() => {
		// Reset store state
		useProductionStore.setState({
			reports: [],
			currentDate: new Date().toISOString().split("T")[0],
			currentVersion: null,
			isReadOnly: false,
		});
	});

	describe("version history integration", () => {
		it("getVersionsForDate returns versions compatible with VersionInfo type", () => {
			const quantities = new Map<string, number>();
			FLAVOR_CODES.forEach((flavor) => {
				quantities.set(`${flavor}:A`, 10);
			});

			// Create two versions
			useProductionStore.getState().saveReport("2024-01-15", quantities);
			useProductionStore.getState().saveReport("2024-01-15", quantities);

			const versions = useProductionStore
				.getState()
				.getVersionsForDate("2024-01-15");

			// Check compatibility with VersionInfo
			expect(versions).toHaveLength(2);
			expect(versions[0]).toHaveProperty("version");
			expect(versions[0]).toHaveProperty("createdAt");
			expect(versions[0]).toHaveProperty("date");
			expect(typeof versions[0].version).toBe("number");
			expect(typeof versions[0].createdAt).toBe("string");
			expect(typeof versions[0].date).toBe("string");
		});

		it("loadVersion sets isReadOnly correctly for historical versions", () => {
			const quantities = new Map<string, number>();
			FLAVOR_CODES.forEach((flavor) => {
				quantities.set(`${flavor}:A`, 10);
			});

			// Create two versions
			useProductionStore.getState().saveReport("2024-01-15", quantities);
			useProductionStore.getState().saveReport("2024-01-15", quantities);

			// Load v1 (historical)
			useProductionStore.getState().loadVersion("2024-01-15", 1);
			expect(useProductionStore.getState().isReadOnly).toBe(true);
			expect(useProductionStore.getState().currentVersion).toBe(1);

			// Load v2 (latest)
			useProductionStore.getState().loadVersion("2024-01-15", 2);
			expect(useProductionStore.getState().isReadOnly).toBe(false);
			expect(useProductionStore.getState().currentVersion).toBe(2);
		});

		it("isReadOnly blocks save operation", () => {
			const quantities = new Map<string, number>();
			FLAVOR_CODES.forEach((flavor) => {
				quantities.set(`${flavor}:A`, 10);
			});

			// Create a version
			useProductionStore.getState().saveReport("2024-01-15", quantities);

			// Load as historical (set read-only)
			useProductionStore.setState({ isReadOnly: true });

			// Try to save
			const result = useProductionStore
				.getState()
				.saveReport("2024-01-15", quantities);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.reason).toContain("historical");
			}
		});

		it("isHistoricalVersion correctly identifies historical versions", () => {
			const quantities = new Map<string, number>();
			FLAVOR_CODES.forEach((flavor) => {
				quantities.set(`${flavor}:A`, 10);
			});

			// Create three versions
			useProductionStore.getState().saveReport("2024-01-15", quantities);
			useProductionStore.getState().saveReport("2024-01-15", quantities);
			useProductionStore.getState().saveReport("2024-01-15", quantities);

			const versions = useProductionStore
				.getState()
				.getVersionsForDate("2024-01-15");

			// v1 and v2 are historical, v3 is current
			expect(isHistoricalVersion(versions, 1)).toBe(true);
			expect(isHistoricalVersion(versions, 2)).toBe(true);
			expect(isHistoricalVersion(versions, 3)).toBe(false);
		});

		it("getReadOnlyMessage returns correct message based on isReadOnly", () => {
			expect(getReadOnlyMessage(true)).toContain("sólo lectura");
			expect(getReadOnlyMessage(false)).toBeNull();
		});
	});

	describe("legacy order integration", () => {
		it("orders with missing flavor are identified as legacy", () => {
			const legacyOrder = {
				id: "order-legacy",
				gymName: "Gym Legacy",
				products: [{ type: "A" as const, quantity: 5 }],
				status: "Entregado" as const,
				createdAt: "2024-01-15T10:00:00Z",
				updatedAt: "2024-01-15T10:00:00Z",
			} as const;

			expect(isLegacyOrder(legacyOrder as any)).toBe(true);
		});

		it("orders with valid flavor are not legacy", () => {
			const validOrder = {
				id: "order-valid",
				gymName: "Gym Valid",
				products: [{ type: "A" as const, quantity: 5 }],
				status: "Entregado" as const,
				flavor: "Apple Pie" as const,
				createdAt: "2024-01-15T10:00:00Z",
				updatedAt: "2024-01-15T10:00:00Z",
			};

			expect(isLegacyOrder(validOrder)).toBe(false);
		});

		it("filterLegacyOrdersForDate filters by date and legacy status", () => {
			const orders = [
				{
					id: "order-1",
					gymName: "Gym A",
					products: [{ type: "A" as const, quantity: 5 }],
					status: "Entregado" as const,
					flavor: "Apple Pie" as const,
					createdAt: "2024-01-15T10:00:00Z",
					updatedAt: "2024-01-15T10:00:00Z",
				},
				{
					id: "order-2",
					gymName: "Gym B",
					products: [{ type: "GNY" as const, quantity: 3 }],
					status: "Entregado" as const,
					createdAt: "2024-01-15T11:00:00Z",
					updatedAt: "2024-01-15T11:00:00Z",
				} as any, // Missing flavor - legacy
				{
					id: "order-3",
					gymName: "Gym C",
					products: [{ type: "C" as const, quantity: 2 }],
					status: "Entregado" as const,
					createdAt: "2024-01-16T10:00:00Z",
					updatedAt: "2024-01-16T10:00:00Z",
				} as any, // Missing flavor but different date
			];

			const legacyForJan15 = filterLegacyOrdersForDate(orders, "2024-01-15");
			expect(legacyForJan15).toHaveLength(1);
			expect(legacyForJan15[0].id).toBe("order-2");
		});

		it("makeEligibleForReconciliation adds valid flavor and updates timestamp", () => {
			const legacyOrder = {
				id: "order-legacy",
				gymName: "Gym Legacy",
				products: [{ type: "A", quantity: 5 }],
				status: "Entregado",
				createdAt: "2024-01-15T10:00:00Z",
				updatedAt: "2024-01-15T10:00:00Z",
			} as any;

			const fixedOrder = makeEligibleForReconciliation(
				legacyOrder,
				"Berry Lover",
			);

			expect(fixedOrder.flavor).toBe("Berry Lover");
			expect(fixedOrder.id).toBe(legacyOrder.id);
			expect(fixedOrder.gymName).toBe(legacyOrder.gymName);
			expect(fixedOrder.updatedAt).not.toBe(legacyOrder.updatedAt);
		});

		it("fixed legacy order is no longer legacy", () => {
			const legacyOrder = {
				id: "order-legacy",
				gymName: "Gym Legacy",
				products: [{ type: "A", quantity: 5 }],
				status: "Entregado",
				createdAt: "2024-01-15T10:00:00Z",
				updatedAt: "2024-01-15T10:00:00Z",
			} as any;

			const fixedOrder = makeEligibleForReconciliation(
				legacyOrder,
				"Choco Power",
			);

			expect(isLegacyOrder(fixedOrder)).toBe(false);
		});
	});

	describe("UI/Store workflow", () => {
		it("full workflow: save report, view history, load historical, block save", () => {
			const quantities = new Map<string, number>();
			FLAVOR_CODES.forEach((flavor) => {
				quantities.set(`${flavor}:A`, 10);
			});

			// Save initial report
			const result1 = useProductionStore
				.getState()
				.saveReport("2024-01-15", quantities);
			expect(result1.ok).toBe(true);

			// Modify quantities
			FLAVOR_CODES.forEach((flavor) => {
				quantities.set(`${flavor}:A`, 15);
			});

			// Save second version
			const result2 = useProductionStore
				.getState()
				.saveReport("2024-01-15", quantities);
			expect(result2.ok).toBe(true);

			// Get versions (for UI display)
			const versions = useProductionStore
				.getState()
				.getVersionsForDate("2024-01-15");
			expect(versions).toHaveLength(2);

			// Load v1 as historical
			useProductionStore.getState().loadVersion("2024-01-15", 1);
			expect(useProductionStore.getState().isReadOnly).toBe(true);

			// UI would show read-only banner
			const readOnlyMessage = getReadOnlyMessage(
				useProductionStore.getState().isReadOnly,
			);
			expect(readOnlyMessage).toContain("sólo lectura");

			// Try to save (should be blocked)
			const result3 = useProductionStore
				.getState()
				.saveReport("2024-01-15", quantities);
			expect(result3.ok).toBe(false);
		});

		it("legacy fix workflow: identify, filter, fix, verify", () => {
			const legacyOrders = [
				{
					id: "order-1",
					gymName: "Gym A",
					products: [{ type: "A" as const, quantity: 5 }],
					status: "Entregado" as const,
					createdAt: "2024-01-15T10:00:00Z",
					updatedAt: "2024-01-15T10:00:00Z",
				} as any,
				{
					id: "order-2",
					gymName: "Gym B",
					products: [{ type: "GNY" as const, quantity: 3 }],
					status: "Entregado" as const,
					flavor: "Berry Lover" as const,
					createdAt: "2024-01-15T11:00:00Z",
					updatedAt: "2024-01-15T11:00:00Z",
				},
			];

			// Step 1: Identify legacy orders
			const order1IsLegacy = isLegacyOrder(legacyOrders[0] as any);
			const order2IsLegacy = isLegacyOrder(legacyOrders[1]);
			expect(order1IsLegacy).toBe(true);
			expect(order2IsLegacy).toBe(false);

			// Step 2: Filter for date
			const todaysLegacy = filterLegacyOrdersForDate(
				legacyOrders,
				"2024-01-15",
			);
			expect(todaysLegacy).toHaveLength(1);

			// Step 3: Fix the legacy order
			const fixedOrder = makeEligibleForReconciliation(
				legacyOrders[0] as any,
				"Apple Pie",
			);

			// Step 4: Verify it's no longer legacy
			expect(isLegacyOrder(fixedOrder)).toBe(false);
			expect(fixedOrder.flavor).toBe("Apple Pie");
		});
	});
});
