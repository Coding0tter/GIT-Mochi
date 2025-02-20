import type { IPagination } from "shared/types/pagination";

export const fetchAllFromPaginatedApiAsync = async (
  requestFn: (pagination: Partial<IPagination>) => any,
) => {
  let pagination: Partial<IPagination> = {
    currentPage: 1,
    limit: 100,
    totalPages: 1,
  };

  let allEntries: any[] = [];

  do {
    const { data, pagination: nextPagination } = await requestFn(pagination);

    allEntries = allEntries.concat(data);

    pagination.currentPage = nextPagination.nextPage;
  } while (
    (pagination?.currentPage ?? Number.MAX_VALUE) < (pagination.totalPages ?? 1)
  );

  return allEntries;
};
