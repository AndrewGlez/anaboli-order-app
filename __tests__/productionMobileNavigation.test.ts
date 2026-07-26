import { SECTIONS, getSectionId, getActiveSection } from "@/components/production/sectionNavigation";

describe("productionMobileNavigation", () => {
  describe("SECTIONS constant", () => {
    it("has concrete section IDs for all dashboard sections", () => {
      expect(SECTIONS).toEqual([
        { id: "date-selector", label: "Fecha" },
        { id: "summary", label: "Resumen" },
        { id: "production-table", label: "Producción" },
        { id: "customer-distribution", label: "Clientes" },
        { id: "version-history", label: "Historial" },
        { id: "legacy-fixes", label: "Correcciones" },
      ]);
    });

    it("has 6 sections", () => {
      expect(SECTIONS).toHaveLength(6);
    });
  });

  describe("getSectionId", () => {
    it("returns correct section ID for index 0", () => {
      expect(getSectionId(0)).toBe("date-selector");
    });

    it("returns correct section ID for index 2", () => {
      expect(getSectionId(2)).toBe("production-table");
    });

    it("returns null for out of bounds index", () => {
      expect(getSectionId(10)).toBeNull();
      expect(getSectionId(-1)).toBeNull();
    });
  });

  describe("getActiveSection", () => {
    it("returns date-selector when scroll Y is 0", () => {
      expect(getActiveSection(0)).toBe("date-selector");
    });

    it("returns production-table when scrolled to table section", () => {
      // Assuming table starts at Y=500
      expect(getActiveSection(550)).toBe("production-table");
    });

    it("returns summary when in summary section", () => {
      expect(getActiveSection(200)).toBe("summary");
    });

    it("returns customer-distribution when in customer section", () => {
      expect(getActiveSection(800)).toBe("customer-distribution");
    });
  });

  describe("mobile behavior predicates", () => {
    it("returns isMobile true for phone breakpoint", () => {
      const { isMobileNav } = require("@/components/production/sectionNavigation");
      expect(isMobileNav("phone")).toBe(true);
    });

    it("returns isMobile false for tablet breakpoint", () => {
      const { isMobileNav } = require("@/components/production/sectionNavigation");
      expect(isMobileNav("tablet")).toBe(false);
    });

    it("returns isMobile false for desktop breakpoint", () => {
      const { isMobileNav } = require("@/components/production/sectionNavigation");
      expect(isMobileNav("desktop")).toBe(false);
    });
  });

  describe("scrollToSection", () => {
    it("calculates scroll position for date-selector", () => {
      const { getScrollPositionForSection } = require("@/components/production/sectionNavigation");
      const position = getScrollPositionForSection("date-selector");
      expect(typeof position).toBe("number");
      expect(position).toBeGreaterThanOrEqual(0);
    });

    it("calculates scroll position for production-table", () => {
      const { getScrollPositionForSection } = require("@/components/production/sectionNavigation");
      const position = getScrollPositionForSection("production-table");
      expect(typeof position).toBe("number");
      expect(position).toBeGreaterThan(0);
    });

    it("returns null for unknown section", () => {
      const { getScrollPositionForSection } = require("@/components/production/sectionNavigation");
      expect(getScrollPositionForSection("unknown-section")).toBeNull();
    });
  });
});
