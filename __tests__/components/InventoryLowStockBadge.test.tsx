import React from "react";
import renderer from "react-test-renderer";
import { LowStockBadge } from "@/components/InventoryLowStockBadge";

describe("LowStockBadge", () => {
  it("renders correctly with low stock", () => {
    const tree = renderer.create(
      <LowStockBadge quantity={1} minThreshold={5} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly on boundary", () => {
    const tree = renderer.create(
      <LowStockBadge quantity={5} minThreshold={5} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("has correct accessibility label", () => {
    const instance = renderer.create(
      <LowStockBadge quantity={2} minThreshold={10} />
    );
    const root = instance.root;
    // Find the View with accessibilityLabel
    const viewWithLabel = root.findAll(
      (node) => node.props.accessibilityLabel === "Low stock: 2 of 10"
    );
    expect(viewWithLabel.length).toBeGreaterThan(0);
  });

  it("has text accessibility role", () => {
    const instance = renderer.create(
      <LowStockBadge quantity={1} minThreshold={5} />
    );
    const root = instance.root;
    const viewWithRole = root.findAll(
      (node) => node.props.accessibilityRole === "text"
    );
    expect(viewWithRole.length).toBeGreaterThan(0);
  });
});
