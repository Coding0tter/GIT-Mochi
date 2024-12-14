export interface IPagination {
  currentPage: number;
  prevPage: number | null;
  nextPage: number | null;
  totalPages: number;
  limit: number;
}
