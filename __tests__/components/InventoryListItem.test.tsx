import React from "react";
import renderer from "react-test-renderer";
import { InventoryListItem } from "@/components/InventoryListItem";
import { StockItem } from "@/types";
import { COLORS } from "@/constants/theme";

const mockColors = COLORS.themed("light");

const mockItem: StockItem = {
  id: "1",
  name: "Whey Protein",
  type: "GNY",
  quantity: 10,
  minThreshold: 5,
  price: 50,
  updatedAt: new Date().toISOString(),
  lastAdjustmentReason: "initial",
};

describe("InventoryListItem", () => {
  it("renders correctly without low stock", () => {
    const instance = renderer.create(
      <InventoryListItem item={mockItem} colors={mockColors} index={0} />
    );
    expect(instance.root.findByProps({ children: "Whey Protein" })).toBeTruthy();
  });

  it("renders correctly with low stock", () => {
    const lowStockItem = { ...mockItem, quantity: 3, minThreshold: 5 };
    const instance = renderer.create(
      <InventoryListItem item={lowStockItem} colors={mockColors} index={0} />
    );
    expect(instance.root.findByProps({ children: "Whey Protein" })).toBeTruthy();
  });

  it("has summary accessibility role", () => {
    const instance = renderer.create(
      <InventoryListItem item={mockItem} colors={mockColors} index={0} />
    );
    const root = instance.root;
    const viewWithRole = root.findAll(
      (node) => node.props.accessibilityRole === "summary"
    );
    expect(viewWithRole.length).toBeGreaterThan(0);
  });
});
