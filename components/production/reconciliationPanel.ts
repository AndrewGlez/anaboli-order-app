export type ReconciliationStatus = "balanced" | "unbalanced";

export interface ReconciliationPanelState {
  totalProduced: number;
  totalAssigned: number;
  delta: number;
  balanced: boolean;
  status: ReconciliationStatus;
  message: string;
  accessibilityLabel: string;
}

export function computeDelta(produced: number, assigned: number): number {
  return produced - assigned;
}

export function isBalanced(produced: number, assigned: number): boolean {
  return produced === assigned;
}

export function statusMessage(balanced: boolean, delta: number): string {
  if (balanced) return "Balanceado";
  const sign = delta > 0 ? "+" : "";
  return `Reconciliación pendiente (delta ${sign}${delta})`;
}

export function statusLabel(balanced: boolean, produced: number, assigned: number, delta: number): string {
  if (balanced) {
    return `Reconciliación balanceada. Producido ${produced}, asignado ${assigned}.`;
  }
  const direction = delta > 0 ? "produjo más de lo asignado" : "asignó más de lo producido";
  return `Reconciliación pendiente. Producido ${produced}, asignado ${assigned}. Se ${direction} por ${Math.abs(delta)}.`;
}

export function buildReconciliationState(
  produced: number,
  assigned: number
): ReconciliationPanelState {
  const delta = computeDelta(produced, assigned);
  const balanced = isBalanced(produced, assigned);
  const status: ReconciliationStatus = balanced ? "balanced" : "unbalanced";
  return {
    totalProduced: produced,
    totalAssigned: assigned,
    delta,
    balanced,
    status,
    message: statusMessage(balanced, delta),
    accessibilityLabel: statusLabel(balanced, produced, assigned, delta),
  };
}

export function statusAccentColor(
  balanced: boolean,
  success: string,
  error: string
): string {
  return balanced ? success : error;
}