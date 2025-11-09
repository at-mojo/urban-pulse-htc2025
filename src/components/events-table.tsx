"use client";

import { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  PencilIcon,
  StarIcon,
  TrashIcon,
} from "lucide-react";

import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Report } from "@prisma/client";
import { Badge } from "./ui/badge";
import { getLocationString } from "@/lib/geocode";
import { ReportModal } from "./reporter-ui";
import { deleteReport } from "@/report";

const columns: ColumnDef<Report>[] = [
  {
    header: "Title",
    accessorKey: "title",
  },
  {
    header: "Description",
    accessorKey: "desc",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-gray-500 line-clamp-1 max-w-[200px]">
          {row.original.desc}
        </div>
      );
    },
  },
  {
    header: "Location",
    cell: ({ row }) => {
      const [location, setLocation] = useState<string | null>(null);
      useEffect(() => {
        const fetchLocation = async () => {
          const location = await getLocationString(
            row.original.lat,
            row.original.lon
          );
          setLocation(location);
        };
        fetchLocation();
      }, [row.original.lat, row.original.lon]);
      return (
        <div className="text-sm text-gray-500 line-clamp-1 max-w-[200px]">
          {location}
        </div>
      );
    },
  },
  {
    header: "Created At",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-gray-500">
          {/* TODO: Fix this */}
          {new Date(row.original.createdAt).toLocaleString()}
        </div>
      );
    },
  },
  {
    header: "Urgency",
    accessorKey: "urgency",
    cell: ({ row }) => {
      return (
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            row.original.urgency === "HIGH"
              ? "bg-red-900 text-white"
              : row.original.urgency === "MEDIUM"
              ? "bg-yellow-900 text-white"
              : "bg-green-900 text-white"
          )}
        >
          {row.original.urgency.charAt(0).toUpperCase() +
            row.original.urgency.slice(1).toLowerCase()}
        </Badge>
      );
    },
  },
  {
    header: "Rating",
    accessorKey: "rating",
    cell: ({ row }) => {
      return (
        <div className="flex flex-row items-center gap-2">
          {Array.from({ length: row.original.rating }).map((_, index) => (
            <StarIcon key={`star-${row.original.id}-${index}`} size={16} />
          ))}
          {Array.from({ length: 5 - row.original.rating }).map((_, index) => (
            <StarIcon
              key={`star-${row.original.id}-${index}`}
              size={16}
              className="text-gray-700"
            />
          ))}
        </div>
      );
    },
  },
  {
    header: "Actions",
    accessorKey: "actions",
    cell: ({ row }) => {
      const [isEditReportModalOpen, setIsEditReportModalOpen] = useState(false);
      return (
        <div className="flex flex-row items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setIsEditReportModalOpen(true)}
          >
            <PencilIcon size={16} />
          </Button>
          {isEditReportModalOpen && (
            <ReportModal
              setModalOpen={setIsEditReportModalOpen}
              mode="edit"
              report={row.original}
            />
          )}
          <Button
            size="icon"
            variant="outline"
            onClick={() => deleteReport({ id: row.original.id })}
          >
            <TrashIcon size={16} />
          </Button>
        </div>
      );
    },
  },
];

export default function EventsTable({ reports }: { reports: Report[] }) {
  const pageSize = 10;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "name",
      desc: false,
    },
  ]);

  const table = useReactTable({
    data: reports,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  });

  const { pages } = usePagination({
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages: table.getPageCount(),
    paginationItemsToDisplay: 5,
  });

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border bg-background">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className="h-11"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          className={cn(
                            header.column.getCanSort() &&
                              "flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            // Enhanced keyboard handling for sorting
                            if (
                              header.column.getCanSort() &&
                              (e.key === "Enter" || e.key === " ")
                            ) {
                              e.preventDefault();
                              header.column.getToggleSortingHandler()?.(e);
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: (
                              <ChevronUpIcon
                                className="shrink-0 opacity-60"
                                size={16}
                                aria-hidden="true"
                              />
                            ),
                            desc: (
                              <ChevronDownIcon
                                className="shrink-0 opacity-60"
                                size={16}
                                aria-hidden="true"
                              />
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-3 max-sm:flex-col">
        {/* Pagination buttons */}
        <Pagination>
          <PaginationContent>
            {/* Previous page button */}
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="disabled:pointer-events-none disabled:opacity-50"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Go to previous page"
              >
                <ChevronLeftIcon size={16} aria-hidden="true" />
              </Button>
            </PaginationItem>

            {/* Page number buttons */}
            {pages.map((page) => {
              const isActive =
                page === table.getState().pagination.pageIndex + 1;
              return (
                <PaginationItem key={page}>
                  <Button
                    size="icon"
                    variant={`${isActive ? "outline" : "ghost"}`}
                    onClick={() => table.setPageIndex(page - 1)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {page}
                  </Button>
                </PaginationItem>
              );
            })}

            {/* Next page button */}
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="disabled:pointer-events-none disabled:opacity-50"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Go to next page"
              >
                <ChevronRightIcon size={16} aria-hidden="true" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
