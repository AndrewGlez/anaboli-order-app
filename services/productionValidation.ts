export function validateQuantity(input: unknown): number {
  // Must be a number
  if (typeof input !== "number") {
    throw new Error("Quantity must be a number");
  }

  // Must be an integer (no fractions)
  if (!Number.isInteger(input)) {
    throw new Error("Quantity must be an integer");
  }

  // Must be non-negative
  if (input < 0) {
    throw new Error("Quantity must be non-negative");
  }

  // Must not be NaN
  if (Number.isNaN(input)) {
    throw new Error("Quantity must be a valid number");
  }

  return input;
}
