import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function CustomPagination({
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
}: CustomPaginationProps) {
  const renderPageNumbers = () => {
    const pages = [];
    const pageLimit = 3;

    if (totalPages <= 5 + pageLimit * 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <PaginationItem
            key={i}
            className={`${
              currentPage === i
                ? "bg-[#F9F5FF] text-[#7747FF] hover:bg-[#F9F5FF] hover:text-[#7747FF]"
                : ""
            }`}
          >
            <PaginationLink
              className="hover:bg-[#F9F5FF] hover:text-[#7747FF]"
              onClick={() => onPageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }
    } else {
      pages.push(
        <PaginationItem
          key={1}
          className={`${
            currentPage === 1
              ? "bg-[#F9F5FF] text-[#7747FF] hover:bg-[#F9F5FF] hover:text-[#7747FF]"
              : ""
          }`}
        >
          <PaginationLink
            className="hover:bg-[#F9F5FF] hover:text-[#7747FF]"
            onClick={() => onPageChange(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>,
      );

      if (currentPage > pageLimit + 2) {
        pages.push(
          <PaginationItem key="start-ellipsis" className="rounded-none">
            <PaginationLink className="hover:bg-[#F9F5FF] hover:text-[#7747FF]">
              ...
            </PaginationLink>
          </PaginationItem>,
        );
      }

      const startPage = Math.max(2, currentPage - pageLimit);
      const endPage = Math.min(totalPages - 1, currentPage + pageLimit);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <PaginationItem
            key={i}
            className={`${
              currentPage === i
                ? "bg-[#F9F5FF] text-[#7747FF] hover:bg-[#F9F5FF] hover:text-[#7747FF]"
                : ""
            }`}
          >
            <PaginationLink
              className="hover:bg-[#F9F5FF] hover:text-[#7747FF]"
              onClick={() => onPageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }

      if (currentPage < totalPages - pageLimit - 1) {
        pages.push(
          <PaginationItem key="end-ellipsis" className="rounded-none">
            <PaginationLink className="hover:bg-[#F9F5FF] hover:text-[#7747FF]">
              ...
            </PaginationLink>
          </PaginationItem>,
        );
      }

      pages.push(
        <PaginationItem
          key={totalPages}
          className={`${
            currentPage === totalPages
              ? "bg-[#F9F5FF] text-[#7747FF] hover:bg-[#F9F5FF] hover:text-[#7747FF]"
              : ""
          }`}
        >
          <PaginationLink
            className="hover:bg-[#F9F5FF] hover:text-[#7747FF]"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return pages;
  };

  return (
    <Pagination className="mx-0 w-full cursor-pointer text-[#717680]">
      <PaginationContent className="gap-0 w-full flex justify-between">
        <PaginationItem className="rounded-sm border">
          <PaginationPrevious
            className="hover:bg-[#F9F5FF] hover:text-[#7747FF]"
            onClick={onPrevious}
          />
        </PaginationItem>
        <div className="flex">{renderPageNumbers()}</div>
        <PaginationItem className="rounded-sm border">
          <PaginationNext
            className="hover:bg-[#F9F5FF] hover:text-[#7747FF]"
            onClick={onNext}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
