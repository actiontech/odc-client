/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ConnectionMode, ResultSetColumn } from '@/d.ts';
import { getNlsValueKey } from '@/util/column';
import exportToSQL from '@/util/sqlExport';
import { getBlobValueKey } from '@/util/utils';
import {
  DataGridRef,
  getSelectedRangeData
} from '@oceanbase-odc/ob-react-data-grid';
import copy from 'copy-to-clipboard';

export function getColumnNameByColumnKey(
  columnKey: string,
  columns: ResultSetColumn[]
) {
  return columns.find((c) => {
    return c?.key === columnKey;
  })?.columnName;
}

/**
 * 添加columnName
 */
export function wrapRow(row, columns: ResultSetColumn[]) {
  if (!row) {
    return null;
  }
  const newRow = { ...row };
  columns.forEach((column) => {
    newRow[column.columnName] = newRow[column.key];
    newRow[getBlobValueKey(column.columnName)] =
      newRow[getBlobValueKey(column.key)];
    newRow[getNlsValueKey(column.columnName)] =
      newRow[getNlsValueKey(column.key)];
  });
  return newRow;
}

const getSelectedColumnsData = (selectedColumns, rows, columns) => {
  const data = [];
  const selectedColumnsDataHead = [];
  for (let i = 0; i < columns?.length; i++) {
    if (selectedColumns.has(columns[i].key)) {
      selectedColumnsDataHead.push(columns[i].name);
    }
  }
  data.push(selectedColumnsDataHead);
  for (let i = 0; i < rows?.length; i++) {
    const selectedRow = [];
    for (const item of selectedColumns) {
      selectedRow.push(rows?.[i]?.[item]);
    }
    data.push(selectedRow);
  }
  return data;
};

export function copyToSQL(
  gridRef: DataGridRef,
  columns: ResultSetColumn[],
  tableName: string = 'tmp_table',
  dbMode: ConnectionMode,
  allRows?: any
) {
  let newRows = [];
  const { selectedRows, selectedColumns, rows } = gridRef;

  // export SQL by selected columns
  if (selectedColumns?.size > 0) {
    const selectedColumnsData = getSelectedColumnsData(
      selectedColumns,
      rows,
      columns
    );
    newRows = rows;
    copy(exportToSQL(selectedColumnsData, columns, tableName, dbMode, newRows));
    return;
  }

  const selectData = getSelectedRangeData(gridRef);
  if (!selectData) return;

  // export SQL by selected rows
  if (selectedRows?.size > 0) {
    for (let item of selectedRows) {
      newRows.push(allRows?.[item]);
    }
    copy(exportToSQL(selectData, columns, tableName, dbMode, newRows));
    return;
  }

  // export SQL by selected cells
  const { rowIdx, endRowIdx } = gridRef.selectedRange;
  if (rowIdx > -1 && endRowIdx > -1) {
    newRows = gridRef?.rows?.slice(rowIdx, endRowIdx + 1);
    copy(exportToSQL(selectData, columns, tableName, dbMode, newRows));
    return;
  }
}

const SELECT_COLUMN_KEY = 'select-row';
const INTERNAL_ROW_KEYS = new Set(['_rowIndex', 'select-row', '__originRow']);

type DiscreteCellKey = string;

function encodeCsvCell(value: unknown): string {
  if (value === null || typeof value === 'undefined') {
    return '""';
  }
  const str = typeof value === 'string' ? value : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

function parseCellKey(key: DiscreteCellKey): {
  rowKey: string;
  columnKey: string;
} {
  const idx = key.indexOf('::');
  return { rowKey: key.slice(0, idx), columnKey: key.slice(idx + 2) };
}

function resolveFieldName(
  columnKey: string,
  resultColumns: ResultSetColumn[],
  gridColumnName?: string
): string {
  const meta = resultColumns?.find((c) => c?.key === columnKey);
  return meta?.columnName || meta?.name || gridColumnName || columnKey;
}

function collectDiscreteCells(
  gridRef: DataGridRef,
  rowKeyName: string,
  discreteKeys: Set<DiscreteCellKey>,
  resultColumns: ResultSetColumn[]
): {
  rowIdx: number;
  columnIdx: number;
  columnKey: string;
  fieldName: string;
  value: unknown;
}[] {
  if (
    !gridRef?.rows?.length ||
    !gridRef?.columns?.length ||
    !discreteKeys?.size
  ) {
    return [];
  }
  const cells = [];
  for (const key of discreteKeys) {
    const { rowKey, columnKey } = parseCellKey(key);
    if (!columnKey || columnKey === SELECT_COLUMN_KEY) {
      continue;
    }
    const rowIdx = gridRef.rows.findIndex(
      (row) => String(row?.[rowKeyName]) === rowKey
    );
    const columnIdx = gridRef.columns.findIndex((col) => col.key === columnKey);
    if (rowIdx < 0 || columnIdx < 0) {
      continue;
    }
    const row = gridRef.rows[rowIdx];
    const col = gridRef.columns[columnIdx];
    cells.push({
      rowIdx,
      columnIdx,
      columnKey,
      fieldName: resolveFieldName(
        columnKey,
        resultColumns,
        col?.name as string
      ),
      value: row?.[columnKey]
    });
  }
  cells.sort((a, b) => a.rowIdx - b.rowIdx || a.columnIdx - b.columnIdx);
  return cells;
}

function collectRangeCells(
  gridRef: DataGridRef,
  resultColumns: ResultSetColumn[]
): {
  rowIdx: number;
  columnIdx: number;
  columnKey: string;
  fieldName: string;
  value: unknown;
}[] {
  const range = gridRef?.selectedRange;
  if (
    !gridRef?.rows?.length ||
    !gridRef?.columns?.length ||
    !range ||
    range.rowIdx < 0 ||
    range.columnIdx < 0
  ) {
    return [];
  }
  const endRow = range.endRowIdx ?? range.rowIdx;
  const endCol = range.endColumnIdx ?? range.columnIdx;
  const minR = Math.min(range.rowIdx, endRow);
  const maxR = Math.max(range.rowIdx, endRow);
  const minC = Math.min(range.columnIdx, endCol);
  const maxC = Math.max(range.columnIdx, endCol);
  const cells = [];
  for (let r = minR; r <= maxR; r++) {
    const row = gridRef.rows[r];
    if (!row) continue;
    for (let c = minC; c <= maxC; c++) {
      const col = gridRef.columns[c];
      if (!col || col.key === SELECT_COLUMN_KEY) continue;
      cells.push({
        rowIdx: r,
        columnIdx: c,
        columnKey: col.key as string,
        fieldName: resolveFieldName(
          col.key as string,
          resultColumns,
          col.name as string
        ),
        value: row[col.key]
      });
    }
  }
  return cells;
}

function cellsToCsv(cells: ReturnType<typeof collectDiscreteCells>): string {
  if (!cells.length) {
    return '';
  }
  const byRow = new Map<number, unknown[]>();
  for (const cell of cells) {
    const list = byRow.get(cell.rowIdx);
    if (list) {
      list.push(cell.value);
    } else {
      byRow.set(cell.rowIdx, [cell.value]);
    }
  }
  return [...byRow.keys()]
    .sort((a, b) => a - b)
    .map((rowIdx) =>
      (byRow.get(rowIdx) || []).map((v) => encodeCsvCell(v)).join(',')
    )
    .join('\r\n');
}

function parseJsonCellValue(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }
  return value;
}

function buildRowDocument(
  row: any,
  resultColumns: ResultSetColumn[]
): Record<string, unknown> {
  const rawCol = resultColumns?.find(
    (c) => c?.columnName === '_raw_json' || c?.name === '_raw_json'
  );
  if (rawCol && row?.[rawCol.key] != null) {
    const parsed = parseJsonCellValue(row[rawCol.key]);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
  }
  const doc: Record<string, unknown> = {};
  for (const col of resultColumns || []) {
    if (!col?.key || INTERNAL_ROW_KEYS.has(col.key)) continue;
    if (col.columnName === '_raw_json' || col.name === '_raw_json') continue;
    const field = col.columnName || col.name || col.key;
    doc[field] = parseJsonCellValue(row?.[col.key]);
  }
  return doc;
}

function cellsToJsonDocs(
  cells: ReturnType<typeof collectDiscreteCells>
): unknown {
  if (!cells.length) {
    return [];
  }
  const byRow = new Map<number, Record<string, unknown>>();
  const rowOrder: number[] = [];
  for (const cell of cells) {
    if (!byRow.has(cell.rowIdx)) {
      byRow.set(cell.rowIdx, {});
      rowOrder.push(cell.rowIdx);
    }
    byRow.get(cell.rowIdx)![cell.fieldName] = parseJsonCellValue(cell.value);
  }
  const docs = rowOrder.map((idx) => byRow.get(idx)!);
  return docs.length === 1 ? docs[0] : docs;
}

/**
 * FE-S2-04：离散选区 CSV；无离散选区时返回 null（调用方回退 defaultOnCopyCsv）。
 */
export function buildDiscreteCsvText(
  gridRef: DataGridRef | null | undefined,
  rowKeyName: string,
  discreteKeys: Set<DiscreteCellKey>,
  resultColumns: ResultSetColumn[]
): string | null {
  if (!gridRef || !discreteKeys?.size) {
    return null;
  }
  const cells = collectDiscreteCells(
    gridRef,
    rowKeyName,
    discreteKeys,
    resultColumns
  );
  if (!cells.length) {
    return null;
  }
  return cellsToCsv(cells);
}

/**
 * FE-S2-05：Mongo 剪贴板 JSON（整行优先 _raw_json；否则按选区字段组对象）。
 */
export function buildSelectionJsonText(
  gridRef: DataGridRef | null | undefined,
  resultColumns: ResultSetColumn[],
  options?: {
    rowKeyName?: string;
    discreteKeys?: Set<DiscreteCellKey>;
    allRows?: any[];
  }
): string | null {
  if (!gridRef) {
    return null;
  }
  const rowKeyName = options?.rowKeyName || '_rowIndex';
  const discreteKeys = options?.discreteKeys;
  const allRows = options?.allRows;

  if (gridRef.selectedRows?.size > 0) {
    const docs = [];
    for (const rowKey of gridRef.selectedRows) {
      const row =
        allRows?.find((r) => r?.[rowKeyName] === rowKey) ||
        gridRef.rows?.find((r) => r?.[rowKeyName] === rowKey);
      if (row) {
        docs.push(buildRowDocument(row, resultColumns));
      }
    }
    if (!docs.length) {
      return null;
    }
    return JSON.stringify(docs.length === 1 ? docs[0] : docs, null, 2);
  }

  if (discreteKeys?.size) {
    const cells = collectDiscreteCells(
      gridRef,
      rowKeyName,
      discreteKeys,
      resultColumns
    );
    if (!cells.length) {
      return null;
    }
    return JSON.stringify(cellsToJsonDocs(cells), null, 2);
  }

  const rangeCells = collectRangeCells(gridRef, resultColumns);
  if (!rangeCells.length) {
    return null;
  }
  return JSON.stringify(cellsToJsonDocs(rangeCells), null, 2);
}

export function copyDiscreteToCsv(
  gridRef: DataGridRef | null | undefined,
  rowKeyName: string,
  discreteKeys: Set<DiscreteCellKey>,
  resultColumns: ResultSetColumn[]
): boolean {
  const text = buildDiscreteCsvText(
    gridRef,
    rowKeyName,
    discreteKeys,
    resultColumns
  );
  if (text == null) {
    return false;
  }
  copy(text, { format: 'text/plain' });
  return true;
}

export function copyToJSON(
  gridRef: DataGridRef | null | undefined,
  resultColumns: ResultSetColumn[],
  options?: {
    rowKeyName?: string;
    discreteKeys?: Set<DiscreteCellKey>;
    allRows?: any[];
  }
): boolean {
  const text = buildSelectionJsonText(gridRef, resultColumns, options);
  if (text == null) {
    return false;
  }
  copy(text, { format: 'text/plain' });
  return true;
}
