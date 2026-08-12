import { useState } from "react";
import { Search, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  onExport?: (format: 'pdf' | 'excel' | 'csv') => void;
  onRowClick?: (row: any) => void;
  actions?: (row: any) => React.ReactNode;
  pageSize?: number;
}

export function DataTable({
  columns,
  data,
  searchable = true,
  filterable = true,
  exportable = true,
  onExport,
  onRowClick,
  actions,
  pageSize = 10,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showFilterPopover, setShowFilterPopover] = useState(false);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return prev.direction === "asc" ? { key, direction: "desc" } : null;
      }
      return { key, direction: "asc" };
    });
  };

  let filteredData = [...data];

  // Apply active column filters
  if (Object.keys(activeFilters).length > 0) {
    filteredData = filteredData.filter((row) => {
      return Object.entries(activeFilters).every(([key, value]) => {
        if (!value) return true;
        const rowValue = row[key];
        return String(rowValue).toLowerCase() === String(value).toLowerCase();
      });
    });
  }

  // Apply search term filter
  if (searchTerm) {
    filteredData = filteredData.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }

  if (sortConfig) {
    filteredData.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Table Header Actions */}
      {(searchable || filterable || exportable) && (
        <div className="p-4 border-b border-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            {searchable && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {filterable && (
              <div className="relative">
                <button
                  onClick={() => setShowFilterPopover(!showFilterPopover)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border ${
                    Object.keys(activeFilters).length > 0
                      ? "bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
                      : "bg-muted hover:bg-muted/80 text-foreground border-transparent"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">
                    Filter
                    {Object.keys(activeFilters).length > 0 &&
                      ` (${Object.keys(activeFilters).length})`}
                  </span>
                </button>

                {showFilterPopover && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowFilterPopover(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-xl z-50 p-4 max-h-[300px] overflow-y-auto">
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                        <h3 className="font-semibold text-sm text-foreground">Filter by Column</h3>
                        {Object.keys(activeFilters).length > 0 && (
                          <button
                            onClick={() => {
                              setActiveFilters({});
                              setCurrentPage(1);
                            }}
                            className="text-xs text-destructive hover:underline font-medium"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      <div className="space-y-4">
                        {columns
                          .filter((col) => col.filterable !== false)
                          .map((column) => {
                            // Extract unique, non-empty values for this column from the original data
                            const uniqueValues = Array.from(
                              new Set(
                                data
                                  .map((row) => row[column.key])
                                  .filter(
                                    (val) => val !== undefined && val !== null && val !== ""
                                  )
                              )
                            ).sort();

                            // If no unique values exist, don't show the filter dropdown for this column
                            if (uniqueValues.length === 0) return null;

                            return (
                              <div key={column.key} className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-muted-foreground font-medium">
                                  {column.label}
                                </label>
                                <select
                                  value={activeFilters[column.key] || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setActiveFilters((prev) => {
                                      const next = { ...prev };
                                      if (val) {
                                        next[column.key] = val;
                                      } else {
                                        delete next[column.key];
                                      }
                                      return next;
                                    });
                                    setCurrentPage(1);
                                  }}
                                  className="w-full text-sm px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                >
                                  <option value="">All</option>
                                  {uniqueValues.map((val) => {
                                    const displayVal =
                                      typeof val === "object" ? JSON.stringify(val) : String(val);
                                    return (
                                      <option key={displayVal} value={displayVal}>
                                        {displayVal}
                                      </option>
                                    );
                                  })}
                                </select>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            {exportable && onExport && (
              <div className="relative">
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Export</span>
                </button>
                {showExportDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowExportDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-36 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                      <button
                        onClick={() => {
                          onExport('pdf');
                          setShowExportDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        Export PDF
                      </button>
                      <button
                        onClick={() => {
                          onExport('excel');
                          setShowExportDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        Export Excel
                      </button>
                      <button
                        onClick={() => {
                          onExport('csv');
                          setShowExportDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        Export CSV
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground ${
                    column.sortable ? "cursor-pointer hover:text-foreground" : ""
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortConfig?.key === column.key && (
                      <span className="text-xs">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-6 py-3 text-right text-xs uppercase tracking-wider text-muted-foreground">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={`${
                    onRowClick ? "cursor-pointer hover:bg-muted/30" : ""
                  } transition-colors`}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length}{" "}
            results
          </p>
          <div className="flex items-center gap-2">
            <button
              title="Previous Page"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm px-4 py-2 bg-muted rounded-lg">
              {currentPage} / {totalPages}
            </span>
            <button
              title="Next Page"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
