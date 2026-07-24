import React from "react";
import renderer from "react-test-renderer";
import { ImportPreview } from "@/components/ImportPreview";
import { ImportResult } from "@/types";

const mockResults: ImportResult[] = [
  { row: 1, status: "ok" },
  { row: 2, status: "error", error: "Invalid quantity" },
  { row: 3, status: "ok" },
];

describe("ImportPreview", () => {
  it("renders correctly with mixed results", () => {
    const tree = renderer.create(
      <ImportPreview
        results={mockResults}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with all errors", () => {
    const errorResults: ImportResult[] = [
      { row: 1, status: "error", error: "Missing headers" },
    ];

    const tree = renderer.create(
      <ImportPreview
        results={errorResults}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
