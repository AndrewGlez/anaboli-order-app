import {
  computeDelta,
  isBalanced,
  statusMessage,
  statusLabel,
  buildReconciliationState,
  statusAccentColor,
} from "@/components/production/reconciliationPanel";

describe("reconciliationPanel helpers", () => {
  describe("computeDelta", () => {
    it("returns 0 when produced equals assigned", () => {
      expect(computeDelta(100, 100)).toBe(0);
    });

    it("returns positive delta when produced > assigned", () => {
      expect(computeDelta(120, 100)).toBe(20);
    });

    it("returns negative delta when produced < assigned", () => {
      expect(computeDelta(80, 100)).toBe(-20);
    });

    it("handles zero produced and zero assigned", () => {
      expect(computeDelta(0, 0)).toBe(0);
    });
  });

  describe("isBalanced", () => {
    it("returns true when produced equals assigned", () => {
      expect(isBalanced(50, 50)).toBe(true);
    });

    it("returns false when produced differs from assigned", () => {
      expect(isBalanced(50, 51)).toBe(false);
      expect(isBalanced(51, 50)).toBe(false);
    });
  });

  describe("statusMessage", () => {
    it("returns 'Balanceado' when balanced", () => {
      expect(statusMessage(true, 0)).toBe("Balanceado");
    });

    it("includes positive delta with sign for overproduction", () => {
      expect(statusMessage(false, 15)).toBe("Reconciliación pendiente (delta +15)");
    });

    it("includes negative delta without extra sign for underproduction", () => {
      expect(statusMessage(false, -7)).toBe("Reconciliación pendiente (delta -7)");
    });
  });

  describe("statusLabel (accessibility)", () => {
    it("describes balanced state with produced and assigned", () => {
      const label = statusLabel(true, 100, 100, 0);
      expect(label).toContain("balanceada");
      expect(label).toContain("100");
      expect(label).not.toContain("pendiente");
    });

    it("describes overproduction direction", () => {
      const label = statusLabel(false, 120, 100, 20);
      expect(label).toContain("pendiente");
      expect(label).toContain("120");
      expect(label).toContain("100");
      expect(label).toContain("produjo más");
      expect(label).toContain("20");
    });

    it("describes underproduction direction", () => {
      const label = statusLabel(false, 80, 100, -20);
      expect(label).toContain("asignó más");
      expect(label).toContain("20");
    });
  });

  describe("buildReconciliationState", () => {
    it("builds a balanced state", () => {
      const state = buildReconciliationState(50, 50);
      expect(state.balanced).toBe(true);
      expect(state.status).toBe("balanced");
      expect(state.delta).toBe(0);
      expect(state.totalProduced).toBe(50);
      expect(state.totalAssigned).toBe(50);
      expect(state.message).toBe("Balanceado");
    });

    it("builds an unbalanced state with positive delta", () => {
      const state = buildReconciliationState(70, 50);
      expect(state.balanced).toBe(false);
      expect(state.status).toBe("unbalanced");
      expect(state.delta).toBe(20);
      expect(state.message).toContain("+20");
    });

    it("builds an unbalanced state with negative delta", () => {
      const state = buildReconciliationState(30, 50);
      expect(state.balanced).toBe(false);
      expect(state.delta).toBe(-20);
      expect(state.message).toContain("-20");
    });

    it("exposes an accessibility label via the state object", () => {
      const state = buildReconciliationState(100, 80);
      expect(state.accessibilityLabel).toContain("100");
      expect(state.accessibilityLabel).toContain("80");
      expect(state.accessibilityLabel).toContain("20");
    });
  });

  describe("statusAccentColor", () => {
    const SUCCESS = "#4ade80";
    const ERROR = "#ef4444";

    it("returns success color when balanced", () => {
      expect(statusAccentColor(true, SUCCESS, ERROR)).toBe(SUCCESS);
    });

    it("returns error color when unbalanced", () => {
      expect(statusAccentColor(false, SUCCESS, ERROR)).toBe(ERROR);
    });
  });
});