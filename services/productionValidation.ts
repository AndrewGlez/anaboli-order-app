export function validateQuantity(input: unknown): number {
  // Must be a number
  if (typeof input !== "number") {
    throw new Error("Quantity must be a number");
  }

  // Must not be NaN (check before integer check since NaN is not an integer)
  if (Number.isNaN(input)) {
    throw new Error("Quantity must be a valid number");
  }

  // Must be an integer (no fractions)
  if (!Number.isInteger(input)) {
    throw new Error("Quantity must be an integer");
  }

  // Must be non-negative
  if (input < 0) {
    throw new Error("Quantity must be non-negative");
  }

  return input;
}
