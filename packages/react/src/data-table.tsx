"use client";
import { Checkbox, type CheckboxProps } from "./checkbox.tsx";
import { ArrowUpIcon, ArrowDownIcon, ArrowsDownUpIcon, CaretDownIcon, ArrowLeftIcon, ArrowRightIcon } from "./icons.tsx";

import {
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
}
export interface DataTableProps<T> {
  label: string;
  rows: readonly T[];
  columns: readonly DataTableColumn<T>[];
  getRowId: (row: T) => string;
  getRowLabel?: (row: T) => string;
  selectedIds?: readonly string[];
  onSelectionChange?: (ids: string[]) => void;
  pageSize?: number;
  /** Language for control labels and sorting; en and ja labels are included. */
  locale?: string;
  loading?: boolean;
  empty?: ReactNode;
  className?: string;
  /** Additional row information, revealed by an explicit, named button. */
  renderDetails?: (row: T) => ReactNode;
}
function Selection({
  mixed,
  ...props
}: CheckboxProps & { mixed?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!mixed;
  }, [mixed]);
  return (
    <div data-slot="data-table-selection-target">
      <Checkbox {...props} ref={ref} />
    </div>
  );
}
/** A semantic table with explicit controls, not an ARIA grid requiring custom cell navigation. */
export function DataTable<T>({
  label,
  rows,
  columns,
  getRowId,
  getRowLabel = getRowId,
  selectedIds = [],
  onSelectionChange,
  pageSize = 10,
  loading = false,
  empty,
  locale = "en",
  className,
  renderDetails,
}: DataTableProps<T>) {
  const uid = useId();
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const span =
    columns.length + Number(!!onSelectionChange) + Number(!!renderDetails);
  const ja = locale.toLowerCase().startsWith("ja");
  const labels = ja
    ? {
        selectPage: "このページを選択",
        row: (name: string) => `${name}を選択`,
        loading: "読み込み中…",
        empty: "該当する項目がありません。",
        pagination: "ページ送り",
        previous: "前のページ",
        next: "次のページ",
      }
    : {
        selectPage: "Select this page",
        row: (name: string) => `Select ${name}`,
        loading: "Loading…",
        empty: "No results found.",
        pagination: "Pagination",
        previous: "Previous page",
        next: "Next page",
      };
  const [sort, setSort] = useState<{ id: string; direction: 1 | -1 }>();
  const [page, setPage] = useState(0);
  const size = Math.max(1, Math.floor(pageSize) || 10);
  const count = Math.max(1, Math.ceil(rows.length / size));
  const current = Math.min(page, count - 1);
  const column = columns.find((item) => item.id === sort?.id);
  const sorted = column?.sortValue
    ? [...rows].sort((a, b) => {
        const av = column.sortValue!(a),
          bv = column.sortValue!(b);
        return (
          (typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv), locale, { numeric: true })) *
          (sort?.direction ?? 1)
        );
      })
    : rows;
  const visible = sorted.slice(current * size, (current + 1) * size);
  const ids = visible.map(getRowId);
  const selected = new Set(selectedIds);
  const selectedOnPage = ids.filter((id) => selected.has(id)).length;
  return (
    <div
      data-slot="data-table"
      className={className}
      aria-busy={loading || undefined}
    >
      <div
        data-slot="data-table-scroll"
        role="region"
        aria-label={label}
        tabIndex={0}
      >
        <table>
          <caption>{label}</caption>
          <thead>
            <tr>
              {onSelectionChange && (
                <th scope="col">
                  <Selection
                    aria-label={labels.selectPage}
                    disabled={!ids.length || loading}
                    checked={ids.length > 0 && selectedOnPage === ids.length}
                    mixed={selectedOnPage > 0 && selectedOnPage < ids.length}
                    onChange={(event) =>
                      onSelectionChange(
                        event.target.checked
                          ? [...new Set([...selectedIds, ...ids])]
                          : selectedIds.filter((id) => !ids.includes(id)),
                      )
                    }
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  aria-sort={
                    col.sortValue
                      ? sort?.id === col.id
                        ? sort.direction === 1
                          ? "ascending"
                          : "descending"
                        : "none"
                      : undefined
                  }
                >
                  {col.sortValue ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSort({
                          id: col.id,
                          direction:
                            sort?.id === col.id && sort.direction === 1
                              ? -1
                              : 1,
                        });
                        setPage(0);
                      }}
                    >
                      {col.header}
                      <span aria-hidden="true">
                        {sort?.id === col.id
                          ? sort.direction === 1
                            ? <ArrowUpIcon size={16} />
                            : <ArrowDownIcon size={16} />
                          : <ArrowsDownUpIcon size={16} />}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
              {renderDetails && (
                <th scope="col">
                  <span data-slot="visually-hidden">
                    {ja ? "詳細" : "Details"}
                  </span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={span}>
                  <span role="status">{labels.loading}</span>
                </td>
              </tr>
            ) : visible.length ? (
              visible.map((row) => (
                <Fragment key={getRowId(row)}>
                  <tr data-selected={selected.has(getRowId(row)) || undefined}>
                    {onSelectionChange && (
                      <td>
                        <Selection
                          aria-label={labels.row(getRowLabel(row))}
                          checked={selected.has(getRowId(row))}
                          onChange={(event) =>
                            onSelectionChange(
                              event.target.checked
                                ? [...new Set([...selectedIds, getRowId(row)])]
                                : selectedIds.filter(
                                    (id) => id !== getRowId(row),
                                  ),
                            )
                          }
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.id}>{col.cell(row)}</td>
                    ))}
                    {renderDetails && (
                      <td>
                        <button
                          type="button"
                          data-slot="data-table-expand"
                          aria-expanded={expanded.has(getRowId(row))}
                          aria-controls={`${uid}-detail-${getRowId(row)}`}
                          aria-label={
                            ja
                              ? `${getRowLabel(row)}の詳細`
                              : `Details for ${getRowLabel(row)}`
                          }
                          onClick={() =>
                            setExpanded((previous) => {
                              const next = new Set(previous);
                              if (next.has(getRowId(row)))
                                next.delete(getRowId(row));
                              else next.add(getRowId(row));
                              return next;
                            })
                          }
                        >
                          <CaretDownIcon size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                  {renderDetails && (
                    <tr
                      hidden={!expanded.has(getRowId(row))}
                      id={`${uid}-detail-${getRowId(row)}`}
                      data-slot="data-table-detail"
                    >
                      <td colSpan={span}>
                        {expanded.has(getRowId(row)) && renderDetails(row)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={span} data-slot="data-table-empty">
                  {empty ?? labels.empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div data-slot="data-table-footer">
        <span role="status">
          {rows.length ? current * size + 1 : 0}–
          {Math.min((current + 1) * size, rows.length)} / {rows.length}
        </span>
        <div aria-label={labels.pagination} role="group">
          <button
            type="button"
            aria-label={labels.previous}
            disabled={current === 0 || loading}
            onClick={() => setPage(current - 1)}
          >
            <ArrowLeftIcon size={16} />
          </button>
          <span>
            {current + 1} / {count}
          </span>
          <button
            type="button"
            aria-label={labels.next}
            disabled={current >= count - 1 || loading}
            onClick={() => setPage(current + 1)}
          >
            <ArrowRightIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
