import React from "react";
import renderer from "react-test-renderer";
import { InventoryListItem } from "@/components/InventoryListItem";
import { StockItem } from "@/types";

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
    const tree = renderer.create(<InventoryListItem item={mockItem} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with low stock", () => {
    const lowStockItem = { ...mockItem, quantity: 3, minThreshold: 5 };
    const tree = renderer.create(<InventoryListItem item={lowStockItem} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("has summary accessibility role", () => {
    const instance = renderer.create(<InventoryListItem item={mockItem} />);
    const root = instance.root;
    const viewWithRole = root.findAll(
      (node) => node.type === "View" && node.props.accessibilityRole === "summary"
    );
    expect(viewWithRole.length).toBeGreaterThan(0);
  });
});
