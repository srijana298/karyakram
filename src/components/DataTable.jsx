import React, { useMemo, useState } from "react";

/**
 * DataTable — reusable table with pagination.
 *
 * Props:
 *   columns    — [{ key, label, className?, render?(row, rowIdx) }]
 *   data       — array of row objects
 *   pageSize   — rows per page (default 10)
 *   emptyMessage
 *   headerClassName?
 *   rowClassName?(row, idx)
 *   tableClassName?
 *   paginationClassName?
 */
export default function DataTable({
  columns = [],
  data = [],
  pageSize = 10,
  emptyMessage = "No data found",
  headerClassName = "",
  rowClassName,
  tableClassName = "",
  paginationClassName = "",
}) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  // Reset to page 1 if data shrinks
  const safePage = Math.min(page, totalPages);

  const pageData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize]);

  const from = data.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, data.length);

  const pages = useMemo(() => {
    const items = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      let start = Math.max(2, safePage - 1);
      let end = Math.min(totalPages - 1, safePage + 1);

      if (safePage <= 3) {
        end = 4;
      } else if (safePage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) items.push("…");
      for (let i = start; i <= end; i++) items.push(i);
      if (end < totalPages - 1) items.push("…");
      items.push(totalPages);
    }

    return items;
  }, [totalPages, safePage]);

  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-dashboard-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div className={`overflow-x-auto ${tableClassName}`}>
        <table className="w-full">
          <thead>
            <tr className={`text-left border-b border-gray-200 bg-stone-50/60 ${headerClassName}`}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-semibold text-dashboard-muted uppercase tracking-wide ${col.className || ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {pageData.map((row, rowIdx) => (
              <tr
                key={row.id ?? rowIdx}
                className={`border-b border-gray-200 last:border-0 hover:bg-stone-50/40 transition-colors ${
                  rowClassName ? rowClassName(row, rowIdx) : ""
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${col.className || ""}`}
                  >
                    {col.render ? col.render(row, rowIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className={`px-4 py-3 border-t border-gray-200 text-xs text-dashboard-muted flex items-center justify-between flex-wrap gap-2 ${paginationClassName}`}
        >
          <p>
            Showing {from} to {to} of {data.length}
          </p>

          <div className="flex items-center gap-1">
            <button
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
              className="w-7 h-7 border border-gray-200 rounded inline-flex items-center justify-center text-dashboard-muted hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ‹
            </button>

            {pages.map((p, i) =>
              p === "…" ? (
                <span key={`e${i}`} className="w-7 h-7 flex items-center justify-center text-dashboard-muted">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded inline-flex items-center justify-center text-xs font-medium ${
                    p === safePage
                      ? "border border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border border-gray-200 text-dashboard-muted hover:bg-stone-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
              className="w-7 h-7 border border-gray-200 rounded inline-flex items-center justify-center text-dashboard-muted hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </>
  );
}
