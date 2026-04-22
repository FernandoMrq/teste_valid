import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DataTable, type DataTableColumn } from './DataTable'

type Row = { id: string; name: string; age: number; meta?: { k: string } | null }

const columns: Array<DataTableColumn<Row>> = [
  { header: 'Nome', accessor: 'name' },
  { header: 'Idade', accessor: 'age' },
  { header: 'Meta', accessor: 'meta' },
  { header: 'Custom', accessor: (r) => <span data-testid="custom">{r.id}</span> },
]

describe('DataTable', () => {
  it('renders empty state when no rows', () => {
    render(<DataTable columns={columns} rows={[]} getRowId={(r) => r.id} />)
    expect(screen.getByText('Nenhum registro.')).toBeInTheDocument()
  })

  it('renders custom empty content when provided', () => {
    render(
      <DataTable
        columns={columns}
        rows={[]}
        getRowId={(r) => r.id}
        emptyContent={<span>custom-empty</span>}
      />
    )
    expect(screen.getByText('custom-empty')).toBeInTheDocument()
  })

  it('renders cells with accessor, function accessor and em-dash for null', () => {
    render(
      <DataTable
        columns={columns}
        rows={[{ id: '1', name: 'Ana', age: 30, meta: null }]}
        getRowId={(r) => r.id}
      />
    )
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.getByTestId('custom')).toHaveTextContent('1')
  })

  it('serializes object values as JSON when no cell renderer', () => {
    render(
      <DataTable
        columns={columns}
        rows={[{ id: '1', name: 'A', age: 1, meta: { k: 'v' } }]}
        getRowId={(r) => r.id}
      />
    )
    expect(screen.getByText('{"k":"v"}')).toBeInTheDocument()
  })
})
