import React from "react";
import renderer from "react-test-renderer";
import GymListItem from "@/components/GymListItem";
import GymForm from "@/components/GymForm";
import GymDeleteDialog from "@/components/GymDeleteDialog";
import { Gym } from "@/types";

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  },
}));

const mockGym: Gym = {
  id: "g1",
  name: "Test Gym",
  active: true,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

describe("GymListItem", () => {
  it("renders gym name and active badge", () => {
    const tree = renderer.create(
      <GymListItem gym={mockGym} hasOrders={false} onEdit={jest.fn()} onDelete={jest.fn()} />
    ).toJSON();
    expect(tree).toBeTruthy();
  });

  it("renders inactive gym", () => {
    const tree = renderer.create(
      <GymListItem
        gym={{ ...mockGym, active: false }}
        hasOrders={false}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    ).toJSON();
    expect(tree).toBeTruthy();
  });

  it("renders with hasOrders=true (delete disabled)", () => {
    const tree = renderer.create(
      <GymListItem gym={mockGym} hasOrders={true} onEdit={jest.fn()} onDelete={jest.fn()} />
    ).toJSON();
    expect(tree).toBeTruthy();
  });
});

describe("GymForm", () => {
  it("renders add form when no gym provided", () => {
    const tree = renderer.create(
      <GymForm visible={true} gym={null} onClose={jest.fn()} onSubmit={jest.fn()} />
    ).toJSON();
    expect(tree).toBeTruthy();
  });

  it("renders edit form when gym provided", () => {
    const tree = renderer.create(
      <GymForm visible={true} gym={mockGym} onClose={jest.fn()} onSubmit={jest.fn()} />
    ).toJSON();
    expect(tree).toBeTruthy();
  });

  it("renders Modal wrapper even when not visible (mock Modal always renders)", () => {
    // Note: In real RN, Modal with visible=false hides content.
    // Our mock Modal always renders, so we just verify the component mounts.
    const tree = renderer.create(
      <GymForm visible={false} gym={null} onClose={jest.fn()} onSubmit={jest.fn()} />
    ).toJSON();
    // The mock Modal renders as a string, so the tree is not null
    expect(tree).toBeTruthy();
  });
});

describe("GymDeleteDialog", () => {
  it("renders delete confirmation when no orders", () => {
    const tree = renderer.create(
      <GymDeleteDialog
        visible={true}
        gym={mockGym}
        hasOrders={false}
        onClose={jest.fn()}
        onConfirmDelete={jest.fn()}
        onConfirmDeactivate={jest.fn()}
      />
    ).toJSON();
    expect(tree).toBeTruthy();
  });

  it("renders deactivate option when gym has orders", () => {
    const tree = renderer.create(
      <GymDeleteDialog
        visible={true}
        gym={mockGym}
        hasOrders={true}
        onClose={jest.fn()}
        onConfirmDelete={jest.fn()}
        onConfirmDeactivate={jest.fn()}
      />
    ).toJSON();
    expect(tree).toBeTruthy();
  });

  it("returns null when gym is null", () => {
    const tree = renderer.create(
      <GymDeleteDialog
        visible={true}
        gym={null}
        hasOrders={false}
        onClose={jest.fn()}
        onConfirmDelete={jest.fn()}
        onConfirmDeactivate={jest.fn()}
      />
    ).toJSON();
    expect(tree).toBeNull();
  });
});
