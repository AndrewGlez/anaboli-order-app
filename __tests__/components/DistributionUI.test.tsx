import React from "react";
import renderer from "react-test-renderer";
import DistributionHeader from "@/components/DistributionHeader";
import DistributionCell from "@/components/DistributionCell";
import DistributionTotals from "@/components/DistributionTotals";
import { DateKey, CellValues } from "@/types";

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  },
}));

// Mock distribution service to avoid store dependencies
jest.mock("@/services/distribution", () => ({
  ...jest.requireActual("@/services/distribution"),
  aggregateByCell: jest.fn(() => 5),
  findOrdersForCell: jest.fn(() => []),
}));

jest.mock("@/hooks/useCellEdit", () => ({
  useCellEdit: jest.fn(() => ({
    value: 5,
    isSaving: false,
    warning: undefined,
    error: undefined,
    commit: jest.fn(),
    rollback: jest.fn(),
  })),
}));

jest.mock("@/hooks/useDistributionMatrix", () => ({
  useDistributionMatrix: jest.fn(() => ({
    date: "2025-07-27",
    gyms: [
      { id: "g1", name: "Gym Alpha", active: true, createdAt: "", updatedAt: "" },
    ],
    rows: [
      {
        flavor: "Apple Pie",
        values: {
          g1: { A: 2, GNY: 3, C: 0, K: 1 },
        },
        total: { A: 2, GNY: 3, C: 0, K: 1 },
      },
    ],
    gymTotals: {
      g1: { A: 2, GNY: 3, C: 0, K: 1 },
    },
    grandTotal: 6,
  })),
}));

describe("DistributionHeader", () => {
  it("renders date and title", () => {
    const tree = renderer.create(
      <DistributionHeader
        selectedDate="2025-07-27"
        onPreviousDay={jest.fn()}
        onNextDay={jest.fn()}
        onGymManagement={jest.fn()}
      />
    ).toJSON();
    expect(tree).toBeTruthy();
  });
});

describe("DistributionCell", () => {
  it("renders with value", () => {
    const tree = renderer.create(
      <DistributionCell
        gymId="g1"
        flavor="Apple Pie"
        productType="A"
        date="2025-07-27"
      />
    ).toJSON();
    expect(tree).toBeTruthy();
  });
});

describe("DistributionTotals", () => {
  it("renders totals", () => {
    const gymTotals: Record<string, CellValues> = {
      g1: { A: 5, GNY: 3, C: 2, K: 1 },
    };
    const tree = renderer.create(
      <DistributionTotals
        gymTotals={gymTotals}
        grandTotal={11}
        gymIds={["g1"]}
      />
    ).toJSON();
    expect(tree).toBeTruthy();
  });

  it("renders with multiple gyms", () => {
    const gymTotals: Record<string, CellValues> = {
      g1: { A: 5, GNY: 3, C: 2, K: 1 },
      g2: { A: 1, GNY: 2, C: 0, K: 3 },
    };
    const tree = renderer.create(
      <DistributionTotals
        gymTotals={gymTotals}
        grandTotal={17}
        gymIds={["g1", "g2"]}
      />
    ).toJSON();
    expect(tree).toBeTruthy();
  });
});
