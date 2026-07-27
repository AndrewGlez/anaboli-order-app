import { renderHook, act } from "@testing-library/react-hooks";
import { useGymCatalog } from "@/hooks/useGymCatalog";
import { useDistributionMatrix } from "@/hooks/useDistributionMatrix";
import { useGymStore } from "@/store/gymStore";
import { useOrderStore } from "@/store/orderStore";

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  },
}));

beforeEach(() => {
  useGymStore.setState({ gyms: [], hydrated: true });
  useOrderStore.setState({ orders: [], gastos: [], lastUpdated: 0 });
});

describe("useGymCatalog", () => {
  it("returns only active gyms sorted by name", () => {
    useGymStore.setState({
      gyms: [
        { id: "g1", name: "Charlie", active: false, createdAt: "", updatedAt: "" },
        { id: "g2", name: "Alpha", active: true, createdAt: "", updatedAt: "" },
        { id: "g3", name: "Bravo", active: true, createdAt: "", updatedAt: "" },
      ],
    });

    const { result } = renderHook(() => useGymCatalog());
    expect(result.current.gyms).toHaveLength(2);
    expect(result.current.gyms[0].name).toBe("Alpha");
    expect(result.current.gyms[1].name).toBe("Bravo");
  });

  it("includes hydrated state from store", () => {
    useGymStore.setState({ hydrated: false });
    const { result } = renderHook(() => useGymCatalog());
    expect(result.current.hydrated).toBe(false);
  });

  it("returns empty for no active gyms", () => {
    const { result } = renderHook(() => useGymCatalog());
    expect(result.current.gyms).toHaveLength(0);
  });
});

describe("useDistributionMatrix", () => {
  it("returns empty matrix for no orders", () => {
    useGymStore.setState({
      gyms: [{ id: "g1", name: "Gym", active: true, createdAt: "", updatedAt: "" }],
    });

    const { result } = renderHook(() => useDistributionMatrix("2025-07-27"));
    expect(result.current.grandTotal).toBe(0);
    expect(result.current.rows).toHaveLength(11);
    expect(result.current.gyms).toHaveLength(1);
  });

  it("aggregates orders into matrix", () => {
    useGymStore.setState({
      gyms: [{ id: "g1", name: "Gym", active: true, createdAt: "", updatedAt: "" }],
    });
    useOrderStore.setState({
      orders: [
        {
          id: "o1",
          gymId: "g1",
          gymName: "Gym",
          products: [{ type: "A", quantity: 5 }],
          status: "Entregado",
          flavor: "Apple Pie",
          createdAt: "2025-07-27T12:00:00.000Z",
          updatedAt: "2025-07-27T12:00:00.000Z",
        },
      ],
    });

    const { result } = renderHook(() => useDistributionMatrix("2025-07-27"));
    const appleRow = result.current.rows.find((r) => r.flavor === "Apple Pie");
    expect(appleRow).toBeDefined();
    expect(appleRow!.values["g1"].A).toBe(5);
    expect(result.current.grandTotal).toBe(5);
  });

  it("excludes inactive gyms", () => {
    useGymStore.setState({
      gyms: [
        { id: "g1", name: "Active", active: true, createdAt: "", updatedAt: "" },
        { id: "g2", name: "Inactive", active: false, createdAt: "", updatedAt: "" },
      ],
    });

    const { result } = renderHook(() => useDistributionMatrix("2025-07-27"));
    expect(result.current.gyms).toHaveLength(1);
    expect(result.current.gyms[0].id).toBe("g1");
  });

  it("excludes orders without gymId", () => {
    useGymStore.setState({
      gyms: [{ id: "g1", name: "Gym", active: true, createdAt: "", updatedAt: "" }],
    });
    useOrderStore.setState({
      orders: [
        {
          id: "o1",
          gymId: "",
          gymName: "Gym",
          products: [{ type: "A", quantity: 5 }],
          status: "Entregado",
          flavor: "Apple Pie",
          createdAt: "2025-07-27T12:00:00.000Z",
          updatedAt: "2025-07-27T12:00:00.000Z",
        },
      ],
    });

    const { result } = renderHook(() => useDistributionMatrix("2025-07-27"));
    expect(result.current.grandTotal).toBe(0);
  });
});
