import { ArrowDown, ArrowUp, ArrowUpDown, Search, SlidersHorizontal, X } from 'lucide-react'
import type { ReactNode } from 'react'

export type SortDirection = 'asc' | 'desc'

interface ListToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  placeholder: string
  filters?: ReactNode
  onClear?: () => void
  children?: ReactNode
}

/** A consistent, responsive control row for every record collection. */
export function ListToolbar({ search, onSearchChange, placeholder, filters, onClear, children }: ListToolbarProps) {
  return (
    <div className="list-toolbar">
      <div className="list-toolbar__controls">
        <label className="search-field">
          <Search size={16} aria-hidden="true" />
          <input value={search} onChange={event => onSearchChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} />
          {search && <button type="button" onClick={() => onSearchChange('')} aria-label="Clear search"><X size={14} /></button>}
        </label>
        {filters && <div className="list-filters"><SlidersHorizontal size={15} aria-hidden="true" />{filters}</div>}
        {onClear && <button type="button" className="btn btn-link" onClick={onClear}>Clear filters</button>}
      </div>
      {children && <div className="list-toolbar__actions">{children}</div>}
    </div>
  )
}

interface SortableHeaderProps {
  label: string
  column: string
  activeColumn: string
  direction: SortDirection
  onSort: (column: string) => void
  align?: 'left' | 'right'
}

export function SortableHeader({ label, column, activeColumn, direction, onSort, align = 'left' }: SortableHeaderProps) {
  const active = activeColumn === column
  const Icon = active ? (direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <th className={align === 'right' ? 'table-align-right' : undefined}>
      <button type="button" className={`sort-button ${active ? 'is-active' : ''}`} onClick={() => onSort(column)}>
        {label}<Icon size={14} aria-hidden="true" />
      </button>
    </th>
  )
}

export function sortRecords<T extends object>(records: T[], column: string, direction: SortDirection) {
  return [...records].sort((a, b) => {
    const first = a[column as keyof T] ?? ''
    const second = b[column as keyof T] ?? ''
    const comparison = typeof first === 'number' && typeof second === 'number'
      ? first - second
      : String(first).localeCompare(String(second), undefined, { numeric: true, sensitivity: 'base' })
    return direction === 'asc' ? comparison : -comparison
  })
}
