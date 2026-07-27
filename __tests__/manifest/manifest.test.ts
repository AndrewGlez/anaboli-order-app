import * as fs from "fs";
import * as path from "path";

describe("PWA Manifest", () => {
	const manifestPath = path.join(__dirname, "../../public/manifest.json");
	let manifest: Record<string, unknown>;

	beforeAll(() => {
		const content = fs.readFileSync(manifestPath, "utf-8");
		manifest = JSON.parse(content);
	});

	it("has required fields", () => {
		expect(manifest.name).toBe("Order App");
		expect(manifest.short_name).toBe("Order App");
		expect(manifest.start_url).toBe("/");
		expect(manifest.display).toBe("standalone");
		expect(manifest.theme_color).toBe("#0a7d4b");
		expect(manifest.background_color).toBe("#ffffff");
		expect(manifest.scope).toBe("/");
	});

	it("has at least one 192px icon", () => {
		const icons = manifest.icons as { sizes: string }[];
		const has192 = icons.some((icon) => icon.sizes === "192x192");
		expect(has192).toBe(true);
	});

	it("has at least one 512px icon", () => {
		const icons = manifest.icons as { sizes: string }[];
		const has512 = icons.some((icon) => icon.sizes === "512x512");
		expect(has512).toBe(true);
	});

	it("has maskable icons", () => {
		const icons = manifest.icons as { purpose?: string }[];
		const hasMaskable = icons.some((icon) => icon.purpose === "maskable");
		expect(hasMaskable).toBe(true);
	});
});
