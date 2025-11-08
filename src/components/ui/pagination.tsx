import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showPageNumbers?: boolean
  maxVisiblePages?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  maxVisiblePages = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const delta = Math.floor(maxVisiblePages / 2)
    let start = Math.max(1, currentPage - delta)
    const end = Math.min(totalPages, start + maxVisiblePages - 1)

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-center space-x-1">
      {/* Previous button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>

      {/* Page numbers */}
      {showPageNumbers && (
        <>
          {/* First page if not visible */}
          {visiblePages[0] > 1 && (
            <>
              <Button
                variant={1 === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(1)}
                className="h-8 w-8 p-0"
              >
                1
              </Button>
              {visiblePages[0] > 2 && (
                <div className="flex h-8 w-8 items-center justify-center">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              )}
            </>
          )}

          {/* Visible page numbers */}
          {visiblePages.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className="h-8 w-8 p-0"
            >
              {page}
            </Button>
          ))}

          {/* Last page if not visible */}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <div className="flex h-8 w-8 items-center justify-center">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              )}
              <Button
                variant={totalPages === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(totalPages)}
                className="h-8 w-8 p-0"
              >
                {totalPages}
              </Button>
            </>
          )}
        </>
      )}

      {/* Next button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  )
}

interface PaginationInfoProps {
  currentPage: number
  pageSize: number
  totalItems: number
  itemName?: string
}

export function PaginationInfo({
  currentPage,
  pageSize,
  totalItems,
  itemName = "items",
}: PaginationInfoProps) {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="text-sm text-muted-foreground">
      Showing {startItem}-{endItem} of {totalItems} {itemName}
    </div>
  )
}