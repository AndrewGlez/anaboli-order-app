import React from "react";
import renderer from "react-test-renderer";
import { DistributionSummary } from "@/components/production/DistributionSummary";
import { DistributionSummary as DistributionSummaryData } from "@/services/productionSelectors";
import { COLORS } from "@/constants/theme";

const mockColors = COLORS.themed("light");

function makeSummary(overrides: Partial<DistributionSummaryData> = {}): DistributionSummaryData {
  return {
    totalCustomers: 3,
    totalAssigned: 20,
    entries: [
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
    ],
    ...overrides,
  };
}

function render(summary: DistributionSummaryData, colors = mockColors) {
  return renderer.create(
    React.createElement(DistributionSummary, { summary, colors })
  );
}

describe("DistributionSummary component", () => {
  it("renders the section title and customer count badge", () => {
    const instance = render(makeSummary());
    const root = instance.root;
    expect(root.findByProps({ children: "Resumen de Distribución" })).toBeTruthy();
  });

  it("renders overall totals (clients and assigned)", () => {
    const instance = render(makeSummary());
    const root = instance.root;
    expect(root.findByProps({ children: "Clientes" })).toBeTruthy();
    expect(root.findByProps({ children: "Total Asignado" })).toBeTruthy();
    // total assigned value 20
    expect(root.findAllByProps({ children: "20" }).length).toBeGreaterThan(0);
  });

  it("renders one row per customer entry", () => {
    const instance = render(makeSummary());
    const root = instance.root;
    // Gym C (10), Gym A (8), Gym B (2) after internal sort
    expect(root.findByProps({ children: "Gym C" })).toBeTruthy();
    expect(root.findByProps({ children: "Gym A" })).toBeTruthy();
    expect(root.findByProps({ children: "Gym B" })).toBeTruthy();
  });

  it("renders the per-customer share percentage", () => {
    const instance = render(makeSummary());
    const root = instance.root;
    expect(root.findByProps({ children: "50.0%" })).toBeTruthy();
    expect(root.findByProps({ children: "40.0%" })).toBeTruthy();
    expect(root.findByProps({ children: "10.0%" })).toBeTruthy();
  });

  it("renders the footer average products per client", () => {
    const instance = render(makeSummary());
    const root = instance.root;
    expect(root.findByProps({ children: "Productos por cliente (promedio)" })).toBeTruthy();
    // 20 / 3 = 6.7
    expect(root.findByProps({ children: "6.7" })).toBeTruthy();
  });

  it("renders the product legend with per-product labels", () => {
    const instance = render(makeSummary());
    const root = instance.root;
    // A appears as both a column and a legend label
    const labels = root.findAllByProps({ children: "A" });
    expect(labels.length).toBeGreaterThan(0);
  });

  it("renders the empty state when there are no customers", () => {
    const emptySummary = makeSummary({
      totalCustomers: 0,
      totalAssigned: 0,
      entries: [],
    });
    const instance = render(emptySummary);
    const root = instance.root;
    expect(root.findByProps({ children: "No hay pedidos para esta fecha" })).toBeTruthy();
  });

  it("accepts dark theme colors without crashing", () => {
    const darkColors = COLORS.themed("dark");
    const instance = render(makeSummary(), darkColors);
    expect(instance.root.findByProps({ children: "Resumen de Distribución" })).toBeTruthy();
  });
});