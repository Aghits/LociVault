import { describe, it, expect } from "vitest";
import { getPaginatedBatch, getBatchInfo } from "@/lib/paginationUtils";

describe("2x4 Reddit Room Grid Pagination Utils", () => {
  const mockRooms = Array.from({ length: 36 }, (_, i) => ({
    id: `room-${i + 1}`,
    title: `Room ${i + 1}`,
    imageUrl: `https://example.com/room-${i + 1}.jpg`,
  }));

  it("returns exactly 8 items (2x4) for the first page/batch by default", () => {
    const batch = getPaginatedBatch(mockRooms, 1, 8);
    expect(batch).toHaveLength(8);
    expect(batch[0].id).toBe("room-1");
    expect(batch[7].id).toBe("room-8");
  });

  it("returns the next 2x4 batch when moving to page 2", () => {
    const batch = getPaginatedBatch(mockRooms, 2, 8);
    expect(batch).toHaveLength(8);
    expect(batch[0].id).toBe("room-9");
    expect(batch[7].id).toBe("room-16");
  });

  it("handles the last partial batch correctly without out-of-bounds", () => {
    // 36 items with batch size 8 has 5 pages: 8, 8, 8, 8, 4
    const lastBatch = getPaginatedBatch(mockRooms, 5, 8);
    expect(lastBatch).toHaveLength(4);
    expect(lastBatch[0].id).toBe("room-33");
    expect(lastBatch[3].id).toBe("room-36");
  });

  it("calculates batch info and remaining count for next button", () => {
    const info = getBatchInfo(mockRooms.length, 1, 8);
    expect(info.totalPages).toBe(5);
    expect(info.hasNext).toBe(true);
    expect(info.hasPrev).toBe(false);
    expect(info.remainingCount).toBe(28);
    expect(info.startItem).toBe(1);
    expect(info.endItem).toBe(8);
  });

  it("handles empty arrays gracefully", () => {
    const emptyBatch = getPaginatedBatch([], 1, 8);
    expect(emptyBatch).toHaveLength(0);
    const info = getBatchInfo(0, 1, 8);
    expect(info.totalPages).toBe(0);
    expect(info.hasNext).toBe(false);
    expect(info.hasPrev).toBe(false);
  });

  it("supports cumulative expansion batching", () => {
    const batch = getPaginatedBatch(mockRooms, 1, 16);
    expect(batch).toHaveLength(16);
    expect(batch[15].id).toBe("room-16");
  });
});
