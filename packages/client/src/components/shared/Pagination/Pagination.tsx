import type { IPagination } from "@mochi-shared/types/pagination";
import styles from "./Pagination.module.css";
import { createEffect, createSignal } from "solid-js";

interface PaginationProps {
  pagination: () => IPagination;
}

const Pagination = (props: PaginationProps) => {
  const [pages, setPages] = createSignal<number[]>([]);

  createEffect(() => {
    const pages = Array.from(
      { length: props.pagination().totalPages },
      (_, i) => i + 1
    );

    setPages(pages);
  }, [props.pagination()]);

  return (
    <div class={styles.pagination}>
      {pages().map((page) => (
        <button
          class={page === props.pagination().currentPage ? styles.active : ""}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
