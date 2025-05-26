import type { IPagination } from "shared/types/pagination";

export const fetchAllFromPaginatedApiAsync = async (
  requestFn: (pagination: Partial<IPagination>) => any,
) => {
  let nextPage: number | null = 1;
  const limit = 100;
  const allEntries: any[] = [];

  while (nextPage != null) {
    const { data, pagination } = await requestFn({
      currentPage: nextPage,
      limit,
    });

    allEntries.push(...data);
    nextPage = !isNaN(pagination.nextPage!) ? pagination.nextPage : null;
  }

  return allEntries;
};
