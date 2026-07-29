import React, { useState, useMemo, ChangeEvent, ReactNode, useEffect } from 'react';
import IconifyIcon from '@/components/common/IconifyIcon';

export interface Column<T> {
  key: Extract<keyof T, string>;
  label: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  title: string;
  subtitle: string;
  icon: string;
  columns: Column<T>[];
  data: T[];
  searchKey: Extract<keyof T, string>;
  searchKeys?: Extract<keyof T, string>[]; // Optional: search across multiple keys
  searchPlaceholder?: string;
  statusOptions?: string[];
  onAdd?: () => void;
  onExport?: () => void;
  isLoading?: boolean; // New prop for loading state
  renderExpandedRow?: (row: T) => ReactNode; // New prop for collapsible rows
  customToolbarNode?: ReactNode; // New prop for custom UI in toolbar
}

// Generic Binary Search for prefix matching on a specific key
function binarySearchPrefix<T>(arr: T[], prefix: string, searchKey: Extract<keyof T, string>): T[] {
  if (!prefix) return arr;
  const lowerPrefix = prefix.toLowerCase();

  let left = 0;
  let right = arr.length - 1;
  let firstMatchIndex = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = String(arr[mid][searchKey]).toLowerCase();

    if (midValue.startsWith(lowerPrefix)) {
      firstMatchIndex = mid;
      right = mid - 1; // Look left to find the VERY FIRST match
    } else if (midValue < lowerPrefix) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  if (firstMatchIndex === -1) return []; // No matches found

  // Collect all subsequent matches
  const results = [];
  for (let i = firstMatchIndex; i < arr.length; i++) {
    if (String(arr[i][searchKey]).toLowerCase().startsWith(lowerPrefix)) {
      results.push(arr[i]);
    } else {
      break; // Since it's sorted, we can break early
    }
  }

  return results;
}

// ─── Hybrid Search ───────────────────────────────────────────────────────────
// Step 1: Binary Search (prefix) on each key → fast O(log n) for exact prefix matches
// Step 2: If no results → Linear Search (substring/contains) on each key → flexible fallback
function hybridSearch<T extends Record<string, any>>(
  data: T[],
  query: string,
  keys: Extract<keyof T, string>[]
): T[] {
  if (!query) return data;
  const lowerQuery = query.toLowerCase();

  // --- Phase 1: Binary Search (prefix) on each key ---
  const seen = new Set<string>();
  const bsResults: T[] = [];

  for (const key of keys) {
    const sorted = [...data].sort((a, b) =>
      String(a[key]).localeCompare(String(b[key]))
    );
    const matches = binarySearchPrefix(sorted, lowerQuery, key);
    for (const item of matches) {
      const uid = JSON.stringify(item);
      if (!seen.has(uid)) {
        seen.add(uid);
        bsResults.push(item);
      }
    }
  }

  // If binary search found results, return them
  if (bsResults.length > 0) return bsResults;

  // --- Phase 2: Linear Search fallback (substring/contains) ---
  const linearResults: T[] = [];
  const seen2 = new Set<string>();

  for (const item of data) {
    for (const key of keys) {
      const val = String(item[key]).toLowerCase();
      if (val.includes(lowerQuery)) {
        const uid = JSON.stringify(item);
        if (!seen2.has(uid)) {
          seen2.add(uid);
          linearResults.push(item);
        }
        break; // Found in this item via one key, no need to check others
      }
    }
  }

  return linearResults;
}

export default function DataTable<T extends Record<string, any>>({
  title,
  subtitle,
  icon,
  columns,
  data,
  searchKey,
  searchKeys,
  searchPlaceholder = 'Search...',
  statusOptions = [],
  onAdd,
  onExport,
  isLoading = false,
  renderExpandedRow,
  customToolbarNode,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Custom dropdown state
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Semua Status');

  // Clear expanded rows when page, search, or filters change
  useEffect(() => {
    setExpandedRows(new Set());
  }, [page, search, selectedStatus, data]);

  // Sorted data for primary key (used by single-key binary search)
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => String(a[searchKey]).localeCompare(String(b[searchKey])));
  }, [data, searchKey]);

  // Hybrid search: binary prefix first, linear substring fallback
  const searchedData = useMemo(() => {
    const activeKeys = searchKeys && searchKeys.length > 0 ? searchKeys : [searchKey];
    if (activeKeys.length === 1) {
      // Single key: binary search prefix only
      return binarySearchPrefix(sortedData, search, activeKeys[0]);
    }
    // Multi key: hybrid
    return hybridSearch(data, search, activeKeys);
  }, [data, sortedData, search, searchKey, searchKeys]);

  // Filter by selected status on top of search results
  const filteredData = useMemo(() => {
    if (selectedStatus === 'Semua Status') return searchedData;
    return searchedData.filter(
      (row) => String(row['status']).toLowerCase() === selectedStatus.toLowerCase()
    );
  }, [searchedData, selectedStatus]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to page 1 on new search
  };

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      
      {/* Top Section (Header & Toolbar) */}
      <div className="px-6 pt-6 pb-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#6b42ff]">
            <IconifyIcon icon={icon} className="text-2xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-[13px] text-gray-500">{subtitle}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {onExport && (
              <button 
                onClick={onExport}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10b981] px-4 h-[38px] text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-[#059669]"
              >
                <IconifyIcon icon="lucide:file-spreadsheet" className="text-base" />
                <span className="leading-none mt-[2px]">Export Excel</span>
              </button>
            )}
            
            {statusOptions.length > 0 && (
              <div 
                className="relative"
                tabIndex={0}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setStatusDropdownOpen(false);
                  }
                }}
              >
                <button
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  className="inline-flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 h-[38px] min-w-[140px] text-[13px] font-medium text-gray-700 outline-none hover:bg-gray-50 focus:border-[#6b42ff] transition-colors"
                >
                  <span className="leading-none mt-[2px]">{selectedStatus}</span>
                  <IconifyIcon icon="lucide:chevron-down" className={`text-gray-400 text-sm transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {statusDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-full rounded-xl border border-gray-100 bg-white p-1 shadow-lg z-20">
                    <button
                      onClick={() => { setSelectedStatus('Semua Status'); setStatusDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-[13px] font-medium rounded-lg transition-colors ${selectedStatus === 'Semua Status' ? 'bg-[#6b42ff]/10 text-[#6b42ff]' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      Semua Status
                    </button>
                    {statusOptions.map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setSelectedStatus(opt); setStatusDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-[13px] font-medium rounded-lg transition-colors ${selectedStatus === opt ? 'bg-[#6b42ff]/10 text-[#6b42ff]' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {customToolbarNode}

            <div className="relative flex-1 min-w-[200px] max-w-[300px]">
              <IconifyIcon icon="lucide:search" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={handleSearch}
                className="w-full rounded-lg border border-gray-200 bg-white h-[38px] pl-11 pr-4 text-[13px] outline-none transition-colors focus:border-[#6b42ff] placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="flex w-full items-center justify-end sm:w-auto mt-4 sm:mt-0">
            {onAdd && (
              <button 
                onClick={onAdd}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6b42ff] px-5 h-[38px] text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-[#5936f1]"
              >
                <IconifyIcon icon="lucide:plus" className="text-base" />
                <span className="leading-none mt-[2px]">Add {title.replace('Data ', '')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[900px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="bg-[#5936f1] text-white">
              {renderExpandedRow && <th className="w-10 px-4 py-4"></th>}
              {columns.map((col, index) => (
                <th 
                  key={col.key} 
                  className={`px-6 py-4 font-bold uppercase tracking-wider text-[11px] ${index === columns.length - 1 ? 'text-right' : ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-20 text-center text-gray-400 text-[14px]">
                  <IconifyIcon icon="lucide:loader-circle" className="animate-spin mr-2 inline-flex text-xl align-middle" />
                  <span className="align-middle">Memuat data...</span>
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => {
                const isExpanded = expandedRows.has(rowIndex);
                const toggleExpand = () => {
                  setExpandedRows((prev) => {
                    const next = new Set(prev);
                    if (next.has(rowIndex)) next.delete(rowIndex);
                    else next.add(rowIndex);
                    return next;
                  });
                };
                
                return (
                  <React.Fragment key={rowIndex}>
                    <tr className="transition-colors hover:bg-gray-50">
                      {renderExpandedRow && (
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <button
                            onClick={toggleExpand}
                            className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                              isExpanded ? 'bg-[#6b42ff] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            <IconifyIcon 
                              icon="lucide:chevron-down" 
                              className={`text-[14px] transition-transform duration-200 ${isExpanded ? 'rotate-180' : '-rotate-90'}`}
                            />
                          </button>
                        </td>
                      )}
                      {columns.map((col, colIndex) => (
                        <td 
                          key={col.key} 
                          className={`px-6 py-3 whitespace-nowrap ${colIndex === columns.length - 1 ? 'text-right' : ''}`}
                        >
                          {col.render ? col.render(row) : String(row[col.key] ?? '')}
                        </td>
                      ))}
                    </tr>
                    {isExpanded && renderExpandedRow && (
                      <tr className="bg-gray-50/50">
                        <td colSpan={columns.length + 1} className="p-0 border-t border-gray-100">
                          <div className="overflow-hidden bg-[#fafafa]">
                            {renderExpandedRow(row)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <IconifyIcon icon="lucide:inbox" className="text-[64px] text-gray-200" />
                    <span className="text-[14px] font-medium text-gray-400">Data tidak ditemukan</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-5 flex flex-col items-center justify-between gap-4 sm:flex-row border-t border-gray-100">
        <div className="text-[13px] font-medium text-gray-500">
          Showing {filteredData.length > 0 ? (page - 1) * rowsPerPage + 1 : 0} - {Math.min(filteredData.length, page * rowsPerPage)} of {filteredData.length} records
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-gray-500">Rows:</span>
            <div className="relative">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="appearance-none rounded-full border border-gray-200 bg-white px-3 py-1 pr-6 text-[13px] font-medium text-gray-700 outline-none"
              >
                <option value={5}>5 rows</option>
                <option value={10}>10 rows</option>
                <option value={25}>25 rows</option>
              </select>
              <IconifyIcon icon="lucide:chevron-down" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <IconifyIcon icon="lucide:chevron-left" className="text-sm" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold transition-colors ${
                  page === pageNum
                    ? 'bg-[#6b42ff] text-white shadow-md shadow-[#6b42ff]/20'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <IconifyIcon icon="lucide:chevron-right" className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
