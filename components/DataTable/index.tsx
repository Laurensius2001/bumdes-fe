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
  addButtonText?: string;
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
  addButtonText,
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
    return searchedData.filter((row) => {
      const s = String(row['status'] || '').toLowerCase();
      const target = selectedStatus.toLowerCase();
      if (target === 'baru' || target === 'menunggu') return s === 'baru' || s === 'menunggu';
      if (target === 'proses' || target === 'diproses' || target === 'dalam proses') return s === 'proses' || s === 'diproses' || s === 'dalam proses';
      return s === target;
    });
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

  const defaultAddText = addButtonText || `Tambah ${title.replace(/^Daftar\s+/i, '')}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header Card */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center justify-center">
            <IconifyIcon icon={icon} className="text-2xl" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {filteredData.length} Data
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center space-x-2.5 self-start md:self-auto">
          {customToolbarNode}
          {onExport && (
            <button
              onClick={onExport}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors shadow-xs flex items-center space-x-2"
            >
              <IconifyIcon icon="lucide:file-spreadsheet" className="text-xs text-slate-500" />
              <span>Export Excel</span>
            </button>
          )}
          {onAdd && (
            <button
              onClick={onAdd}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm shadow-emerald-600/20 flex items-center space-x-2"
            >
              <IconifyIcon icon="lucide:plus" className="text-xs" />
              <span>{defaultAddText}</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Filter Bar & Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          
          {/* Status Tabs */}
          {statusOptions.length > 0 ? (
            <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1 lg:pb-0">
              <button
                onClick={() => { setSelectedStatus('Semua Status'); setPage(1); }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center space-x-2 shrink-0 ${
                  selectedStatus === 'Semua Status'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60 font-medium'
                }`}
              >
                <span>Semua Status</span>
                <span className={`px-1.5 py-0.5 text-[10px] rounded-md font-semibold min-w-[18px] inline-flex items-center justify-center ${selectedStatus === 'Semua Status' ? 'bg-emerald-700/90 text-white' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'}`}>
                  {searchedData.length}
                </span>
              </button>

              {statusOptions.map((opt) => {
                const count = searchedData.filter((row) => {
                  const s = String(row['status'] || '').toUpperCase();
                  const targetOpt = opt.toUpperCase();
                  if (targetOpt === 'BARU' || targetOpt === 'MENUNGGU') return s === 'BARU' || s === 'MENUNGGU';
                  if (targetOpt === 'PROSES' || targetOpt === 'DIPROSES' || targetOpt === 'DALAM PROSES') return s === 'PROSES' || s === 'DIPROSES' || s === 'DALAM PROSES';
                  return s === targetOpt;
                }).length;

                const isSelected = selectedStatus.toLowerCase() === opt.toLowerCase();
                const optUpper = opt.toUpperCase();

                let badgeColor = 'bg-slate-100 text-slate-600 border border-slate-200';
                if (optUpper.includes('BARU') || optUpper.includes('MENUNGGU')) {
                  badgeColor = 'bg-amber-500/10 text-amber-600 border border-amber-500/30';
                } else if (optUpper.includes('PROSES')) {
                  badgeColor = 'bg-sky-500/10 text-sky-600 border border-sky-500/30';
                } else if (optUpper.includes('NONAKTIF') || optUpper.includes('DITOLAK') || optUpper.includes('ISOLIR')) {
                  badgeColor = 'bg-rose-500/10 text-rose-600 border border-rose-500/30';
                } else if (optUpper.includes('SELESAI') || optUpper.includes('AKTIF')) {
                  badgeColor = 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30';
                }

                return (
                  <button
                    key={opt}
                    onClick={() => { setSelectedStatus(opt); setPage(1); }}
                    className={`px-3.5 py-1.5 text-xs rounded-xl transition-all flex items-center space-x-2 shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200/60 font-medium'
                    }`}
                  >
                    <span>{opt}</span>
                    <span className={`px-1.5 py-0.5 text-[10px] rounded-md font-semibold min-w-[18px] inline-flex items-center justify-center ${isSelected ? 'bg-emerald-700/90 text-white' : badgeColor}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : <div />}

          {/* Search Bar & Reset */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-72 lg:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <IconifyIcon icon="lucide:search" className="text-xs" />
              </span>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={handleSearch}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 placeholder-slate-400 transition-all outline-none"
              />
            </div>

            <button
              onClick={() => { setSearch(''); setSelectedStatus('Semua Status'); setPage(1); }}
              title="Reset Filter"
              className="p-2.5 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl border border-slate-200 transition-colors"
            >
              <IconifyIcon icon="lucide:rotate-ccw" className="text-sm" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {renderExpandedRow && <th className="py-3.5 px-4 sm:px-6 w-9"></th>}
                {columns.map((col, index) => (
                  <th
                    key={col.key}
                    className={`py-3.5 px-4 sm:px-6 ${index === columns.length - 1 ? 'text-center' : ''}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-xs sm:text-sm text-slate-700 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + (renderExpandedRow ? 1 : 0)} className="py-16 text-center text-slate-400">
                    <IconifyIcon icon="lucide:loader-circle" className="animate-spin mr-2 inline-flex text-xl align-middle" />
                    <span className="align-middle font-medium">Memuat data...</span>
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
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        {renderExpandedRow && (
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            <button
                              onClick={toggleExpand}
                              className={`flex h-5 w-5 items-center justify-center rounded transition-colors ${
                                isExpanded ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              <IconifyIcon
                                icon="lucide:chevron-down"
                                className={`text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : '-rotate-90'}`}
                              />
                            </button>
                          </td>
                        )}
                        {columns.map((col, colIndex) => (
                          <td
                            key={col.key}
                            className={`py-3.5 px-4 sm:px-6 whitespace-nowrap ${colIndex === columns.length - 1 ? 'text-center' : ''}`}
                          >
                            {col.render ? col.render(row) : String(row[col.key] ?? '')}
                          </td>
                        ))}
                      </tr>
                      {isExpanded && renderExpandedRow && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={columns.length + 1} className="p-0 border-t border-slate-100">
                            <div className="overflow-hidden bg-slate-50/80">
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
                  <td colSpan={columns.length + (renderExpandedRow ? 1 : 0)} className="py-16 px-4 text-center">
                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200/60">
                      <IconifyIcon icon="lucide:folder-open" className="text-2xl" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800">Data Tidak Ditemukan</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Belum ada data keluhan pelanggan untuk kriteria atau status yang Anda pilih.
                    </p>
                    <button
                      onClick={() => { setSearch(''); setSelectedStatus('Semua Status'); setPage(1); }}
                      className="mt-4 inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-xl transition-colors"
                    >
                      <IconifyIcon icon="lucide:rotate-ccw" className="text-xs" />
                      <span>Reset Filter & Pencarian</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer & Pagination */}
        <div className="px-4 sm:px-6 py-4 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            Menampilkan {filteredData.length > 0 ? (page - 1) * rowsPerPage + 1 : 0} - {Math.min(filteredData.length, page * rowsPerPage)} dari {filteredData.length} keluhan
          </p>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span>Tampilkan:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-emerald-500 text-xs font-medium text-slate-700 outline-none"
              >
                <option value={5}>5 Baris</option>
                <option value={10}>10 Baris</option>
                <option value={25}>25 Baris</option>
                <option value={50}>50 Baris</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <IconifyIcon icon="lucide:chevron-left" className="text-xs px-1" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${
                    page === pageNum
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <IconifyIcon icon="lucide:chevron-right" className="text-xs px-1" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
