import { Table, Text } from '@mantine/core';
import type { ReactNode } from 'react';

export interface ReportColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface ReportTableProps<T> {
  columns: ReportColumn<T>[];
  rows: T[];
  emptyMessage?: string;
}

/** Tabla reutilizable para consultas RF12 de solo lectura. */
export function ReportTable<T extends object>({
  columns,
  rows,
  emptyMessage = 'Sin datos para los filtros seleccionados.',
}: ReportTableProps<T>) {
  if (rows.length === 0) {
    return (
      <Text size="sm" c="dimmed" py="md">
        {emptyMessage}
      </Text>
    );
  }

  return (
    <Table striped highlightOnHover withTableBorder withColumnBorders className="sga-tnum">
      <Table.Thead>
        <Table.Tr>
          {columns.map((col) => (
            <Table.Th key={col.key} ta={col.align}>
              {col.header}
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row, i) => (
          <Table.Tr key={i}>
            {columns.map((col) => (
              <Table.Td key={col.key} ta={col.align}>
                {col.render(row)}
              </Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
