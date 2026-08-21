export interface BatchInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
  remainingCount: number;
  startItem: number;
  endItem: number;
}

/**
 * Returns a sliced batch of items for 2x4 (or custom) grid pagination.
 * @param items Full array of items
 * @param page 1-indexed page number
 * @param pageSize Number of items per batch (default: 8 for 2x4 grid)
 */
export function getPaginatedBatch<T>(items: T[], page: number, pageSize: number = 8): T[] {
  if (!items || items.length === 0 || page < 1) {
    return [];
  }
  const startIndex = (page - 1) * pageSize;
  if (startIndex >= items.length) {
    return [];
  }
  return items.slice(startIndex, startIndex + pageSize);
}

/**
 * Calculates pagination metadata for navigation and indicators.
 */
export function getBatchInfo(totalItems: number, page: number, pageSize: number = 8): BatchInfo {
  if (totalItems <= 0) {
    return {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize,
      hasNext: false,
      hasPrev: false,
      remainingCount: 0,
      startItem: 0,
      endItem: 0,
    };
  }

  const totalPages = Math.ceil(totalItems / pageSize);
  const safePage = Math.max(1, Math.min(page, totalPages));
  const startItem = (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);
  const remainingCount = Math.max(0, totalItems - endItem);

  return {
    totalItems,
    totalPages,
    currentPage: safePage,
    pageSize,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
    remainingCount,
    startItem,
    endItem,
  };
}
