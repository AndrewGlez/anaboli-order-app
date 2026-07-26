import { TAB_ITEMS } from "@/components/navigation/tabConfig";

// Mock lucide-react-native icons
jest.mock("lucide-react-native", () => ({
  Clipboard: "Clipboard",
  BarChart4: "BarChart4",
  Settings: "Settings",
  PlusCircle: "PlusCircle",
  Package: "Package",
}));

describe("productionNavigation", () => {
  describe("tabConfig", () => {
    it("registers /production route", () => {
      const productionTab = TAB_ITEMS.find((item) => item.name === "production");
      expect(productionTab).toBeDefined();
      expect(productionTab?.href).toBe("/production");
    });

    it("has label for production", () => {
      const productionTab = TAB_ITEMS.find((item) => item.name === "production");
      expect(productionTab?.title).toBe("Producción");
    });

    it("preserves existing routes", () => {
      const existingRoutes = ["/production", "/inventory", "/settings"];
      existingRoutes.forEach((href) => {
        const tab = TAB_ITEMS.find((item) => item.href === href);
        expect(tab).toBeDefined();
      });
    });

    it("has correct order of tabs", () => {
      const hrefs = TAB_ITEMS.map((item) => item.href);
      expect(hrefs).toEqual(["/inventory", "/production", "/settings"]);
    });
  });
});
