import { TAB_ITEMS } from "../../../components/navigation/tabConfig";

describe("tabConfig", () => {
	it("has 3 tab items", () => {
		expect(TAB_ITEMS).toHaveLength(3);
	});

	it("each item has required fields", () => {
		TAB_ITEMS.forEach((item) => {
			expect(item).toHaveProperty("name");
			expect(item).toHaveProperty("href");
			expect(item).toHaveProperty("title");
			expect(item).toHaveProperty("icon");
		});
	});

	it("has correct tab names", () => {
		expect(TAB_ITEMS[0].name).toBe("inventory");
		expect(TAB_ITEMS[1].name).toBe("production");
		expect(TAB_ITEMS[2].name).toBe("settings");
	});

	it("has correct tab titles", () => {
		expect(TAB_ITEMS[0].title).toBe("Inventario");
		expect(TAB_ITEMS[1].title).toBe("Producción");
		expect(TAB_ITEMS[2].title).toBe("Ajustes");
	});
});
