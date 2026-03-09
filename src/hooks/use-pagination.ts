import { useEffect, useState } from "react";

interface UsePaginationProps<T> {
  items: T[];
  itemsPerPage: number;
}

export function usePagination<T>({
  items,
  itemsPerPage,
}: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currentItems, setCurrentItems] = useState<T[]>([]);

  useEffect(() => {
    setTotalPages(Math.ceil(items.length / itemsPerPage));
    setCurrentPage(1);
  }, [items, itemsPerPage]);

  useEffect(() => {
    setCurrentItems(
      items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    );
  }, [items, itemsPerPage, currentPage]);

  const handleClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevious = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  return {
    currentPage,
    totalPages,
    currentItems,
    handleClick,
    handlePrevious,
    handleNext,
  };
}
