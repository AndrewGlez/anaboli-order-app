import { canPrint, printReport } from "@/services/web/productionPrint";
import { Platform } from "react-native";

// Mock Platform
jest.mock("react-native", () => ({
	Platform: {
		OS: "web",
	},
}));

describe("productionPrint", () => {
	const originalWindow = global.window;

	beforeEach(() => {
		// Reset window mock
		global.window = {
			print: jest.fn(),
		} as unknown as Window & typeof globalThis;
	});

	afterAll(() => {
		global.window = originalWindow;
	});

	describe("canPrint", () => {
		it("returns true on web platform", () => {
			expect(canPrint()).toBe(true);
		});

		it("returns false when window is undefined", () => {
			global.window = undefined as unknown as Window & typeof globalThis;
			expect(canPrint()).toBe(false);
		});
	});

	describe("printReport", () => {
		it("calls window.print() on web", () => {
			printReport();
			expect(global.window.print).toHaveBeenCalled();
		});

		it("does not throw when window is undefined", () => {
			global.window = undefined as unknown as Window & typeof globalThis;
			expect(() => printReport()).not.toThrow();
		});
	});
});

describe("productionPrint - mobile", () => {
	const originalOS = Platform.OS;

	beforeEach(() => {
		Object.defineProperty(Platform, "OS", {
			value: "ios",
			configurable: true,
		});
	});

	afterEach(() => {
		Object.defineProperty(Platform, "OS", {
			value: originalOS,
			configurable: true,
		});
	});

	it("returns false on mobile platform", () => {
		expect(canPrint()).toBe(false);
	});
});
