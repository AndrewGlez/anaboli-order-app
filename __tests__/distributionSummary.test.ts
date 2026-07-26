import {
  formatShare,
  formatAssigned,
  sortEntriesByAssignedDesc,
  getProductCount,
  getShareColor,
  isTopEntry,
  getCustomerRank,
} from "@/components/production/distributionSummary";
import { DistributionSummaryEntry } from "@/services/productionSelectors";

describe("distributionSummary helpers", () => {
  const entries: DistributionSummaryEntry[] = [
    {
      customer: "Gym A",
      flavor: "Apple Pie",
      assignedTotal: 8,
      share: 40,
      productCounts: { A: 5, GNY: 0, C: 3, K: 0 },
    },
    {
      customer: "Gym B",
      flavor: "Berry Lover",
      assignedTotal: 2,
      share: 10,
      productCounts: { A: 0, GNY: 2, C: 0, K: 0 },
    },
    {
      customer: "Gym C",
      flavor: "Apple Pie",
      assignedTotal: 10,
      share: 50,
      productCounts: { A: 10, GNY: 0, C: 0, K: 0 },
    },
  ];

  describe("formatShare", () => {
    it("formats a whole percentage with one decimal", () => {
      expect(formatShare(40)).toBe("40.0%");
    });

    it("formats a fractional percentage with one decimal", () => {
      expect(formatShare(33.333)).toBe("33.3%");
    });

    it("formats zero", () => {
      expect(formatShare(0)).toBe("0.0%");
    });
  });

  describe("formatAssigned", () => {
    it("formats a positive integer", () => {
      expect(formatAssigned(8)).toBe("8");
    });

    it("formats zero", () => {
      expect(formatAssigned(0)).toBe("0");
    });

    it("formats large numbers", () => {
      expect(formatAssigned(1234)).toBe("1234");
    });
  });

  describe("sortEntriesByAssignedDesc", () => {
    it("sorts entries by assignedTotal descending", () => {
      const sorted = sortEntriesByAssignedDesc(entries);
      expect(sorted[0].customer).toBe("Gym C");
      expect(sorted[1].customer).toBe("Gym A");
      expect(sorted[2].customer).toBe("Gym B");
    });

    it("does not mutate the original array", () => {
      const original = [...entries];
      sortEntriesByAssignedDesc(entries);
      expect(entries).toEqual(original);
    });

    it("handles empty array", () => {
      expect(sortEntriesByAssignedDesc([])).toEqual([]);
    });
  });

  describe("getProductCount", () => {
    it("returns the count for a product the customer ordered", () => {
      expect(getProductCount(entries[0], "A")).toBe(5);
      expect(getProductCount(entries[0], "C")).toBe(3);
    });

    it("returns zero for a product the customer did not order", () => {
      expect(getProductCount(entries[0], "GNY")).toBe(0);
      expect(getProductCount(entries[0], "K")).toBe(0);
    });
  });

  describe("getShareColor", () => {
    it("returns primary color when share is at or above the threshold", () => {
      expect(getShareColor(25, "#22c55e", "#64748b")).toBe("#22c55e");
      expect(getShareColor(50, "#22c55e", "#64748b")).toBe("#22c55e");
    });

    it("returns textLight color when share is below the threshold", () => {
      expect(getShareColor(10, "#22c55e", "#64748b")).toBe("#64748b");
      expect(getShareColor(24.9, "#22c55e", "#64748b")).toBe("#64748b");
    });
  });

  describe("isTopEntry", () => {
    it("returns true for the first rank entry with assigned total above zero", () => {
      expect(isTopEntry(entries[0], 1)).toBe(true);
    });

    it("returns false for rank greater than 1", () => {
      expect(isTopEntry(entries[0], 2)).toBe(false);
    });
  });

  describe("getCustomerRank", () => {
    it("returns the 1-based rank of a customer by id", () => {
      expect(getCustomerRank(entries, "Gym A")).toBe(1);
      expect(getCustomerRank(entries, "Gym B")).toBe(2);
    });

    it("returns 0 when the customer is not found", () => {
      expect(getCustomerRank(entries, "Unknown Gym")).toBe(0);
    });
  });
});