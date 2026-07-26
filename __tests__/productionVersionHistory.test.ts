import { VersionInfo, formatVersionLabel, isHistoricalVersion, getReadOnlyMessage } from "@/components/production/versionHistory";

describe("productionVersionHistory", () => {
  describe("formatVersionLabel", () => {
    it("formats v1 correctly", () => {
      const version: VersionInfo = { version: 1, createdAt: "2024-01-15T10:00:00Z", date: "2024-01-15" };
      expect(formatVersionLabel(version)).toBe("Versión 1");
    });

    it("formats v2 correctly", () => {
      const version: VersionInfo = { version: 2, createdAt: "2024-01-15T14:30:00Z", date: "2024-01-15" };
      expect(formatVersionLabel(version)).toBe("Versión 2");
    });

    it("formats v10+ correctly", () => {
      const version: VersionInfo = { version: 10, createdAt: "2024-01-15T16:00:00Z", date: "2024-01-15" };
      expect(formatVersionLabel(version)).toBe("Versión 10");
    });
  });

  describe("isHistoricalVersion", () => {
    it("returns true when version is not the latest", () => {
      const versions: VersionInfo[] = [
        { version: 1, createdAt: "2024-01-15T10:00:00Z", date: "2024-01-15" },
        { version: 2, createdAt: "2024-01-15T14:00:00Z", date: "2024-01-15" },
        { version: 3, createdAt: "2024-01-15T16:00:00Z", date: "2024-01-15" },
      ];
      expect(isHistoricalVersion(versions, 1)).toBe(true);
      expect(isHistoricalVersion(versions, 2)).toBe(true);
    });

    it("returns false when version is the latest", () => {
      const versions: VersionInfo[] = [
        { version: 1, createdAt: "2024-01-15T10:00:00Z", date: "2024-01-15" },
        { version: 2, createdAt: "2024-01-15T14:00:00Z", date: "2024-01-15" },
        { version: 3, createdAt: "2024-01-15T16:00:00Z", date: "2024-01-15" },
      ];
      expect(isHistoricalVersion(versions, 3)).toBe(false);
    });

    it("returns false when there is only one version", () => {
      const versions: VersionInfo[] = [
        { version: 1, createdAt: "2024-01-15T10:00:00Z", date: "2024-01-15" },
      ];
      expect(isHistoricalVersion(versions, 1)).toBe(false);
    });

    it("returns false for empty versions array", () => {
      expect(isHistoricalVersion([], 1)).toBe(false);
    });
  });

  describe("getReadOnlyMessage", () => {
    it("returns appropriate message for historical version", () => {
      expect(getReadOnlyMessage(true)).toContain("sólo lectura");
    });

    it("returns null for non-historical version", () => {
      expect(getReadOnlyMessage(false)).toBeNull();
    });
  });

  describe("sortVersions", () => {
    it("sorts versions in descending order (newest first)", () => {
      const { sortVersionsDesc } = require("@/components/production/versionHistory");
      const versions: VersionInfo[] = [
        { version: 1, createdAt: "2024-01-15T10:00:00Z", date: "2024-01-15" },
        { version: 3, createdAt: "2024-01-15T16:00:00Z", date: "2024-01-15" },
        { version: 2, createdAt: "2024-01-15T14:00:00Z", date: "2024-01-15" },
      ];
      const sorted = sortVersionsDesc(versions);
      expect(sorted[0].version).toBe(3);
      expect(sorted[1].version).toBe(2);
      expect(sorted[2].version).toBe(1);
    });

    it("handles empty array", () => {
      const { sortVersionsDesc } = require("@/components/production/versionHistory");
      expect(sortVersionsDesc([])).toEqual([]);
    });
  });

  describe("formatVersionTime", () => {
    it("formats version time in Spanish locale", () => {
      const { formatVersionTime } = require("@/components/production/versionHistory");
      const time = formatVersionTime("2024-01-15T14:30:00Z");
      expect(typeof time).toBe("string");
      expect(time.length).toBeGreaterThan(0);
    });
  });
});
