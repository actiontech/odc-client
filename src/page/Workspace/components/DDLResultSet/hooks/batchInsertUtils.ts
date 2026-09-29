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

import { ITableColumn, ResultSetColumn } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import type { DataGridRef } from '@oceanbase-odc/ob-react-data-grid';
import type { CalculatedColumn } from '@oceanbase-odc/ob-react-data-grid/lib/types';
import type { RowType } from '../../EditableTable';
import {
  formatPasteCellValue,
  isBatchFillWritableCell
} from './useBatchFillPaste';

export interface BatchInsertField {
  /** 网格/弹窗行绑定 key（`${columnName}_${index}`） */
  key: string;
  /** 展示名（结果集 columnLabel / 别名） */
  name: string;
  /** 写回用原始列名（元数据 columnName，不得用别名） */
  columnName: string;
}

export interface DialogCell {
  /** true = 未设置（提交走 DEFAULT）；false = 用户已输入/粘贴（含空串） */
  unset: boolean;
  text: string;
}

export type DialogRow = Record<string, DialogCell>;

export function createEmptyDialogRow(fields: BatchInsertField[]): DialogRow {
  const row: DialogRow = {};
  fields.forEach((f) => {
    row[f.key] = { unset: true, text: '' };
  });
  return row;
}

export function parseClipboardTSV(text: string): string[][] {
  let normalized = text.replace(/\r\n/g, '\n');
  if (normalized.endsWith('\n')) {
    normalized = normalized.substring(0, normalized.length - 1);
  }
  if (!normalized) return [];
  return normalized.split('\n').map((line) => line.split('\t'));
}

/**
 * 从当前选区收集批量插入字段：去重、按结果集列序、仅可编辑非内部（与 S1 可写判定一致）。
 */
export function collectBatchInsertFields(options: {
  grid: DataGridRef | null | undefined;
  columnsToDisplay: ResultSetColumn[];
  tableColumns?: Partial<ITableColumn>[];
  selectedCellColumnsKey?: Array<string | number>;
}): { writable: BatchInsertField[]; skipped: BatchInsertField[] } {
  const {
    grid,
    columnsToDisplay,
    tableColumns,
    selectedCellColumnsKey = []
  } = options;
  const keyOrder: string[] = [];
  const seen = new Set<string>();

  const pushKey = (key: string | undefined | null) => {
    if (!key || seen.has(key)) return;
    seen.add(key);
    keyOrder.push(String(key));
  };

  const range = grid?.selectedRange;
  const gridColumns = (grid?.columns || []) as CalculatedColumn<
    RowType<any>,
    any
  >[];
  if (range && range.columnIdx >= 0 && range.endColumnIdx >= 0) {
    const start = Math.min(range.columnIdx, range.endColumnIdx);
    const end = Math.max(range.columnIdx, range.endColumnIdx);
    for (let c = start; c <= end; c++) {
      pushKey(gridColumns[c]?.key as string);
    }
  }

  selectedCellColumnsKey.forEach((k) => pushKey(String(k)));

  // 按结果集列序重排
  const orderedKeys = columnsToDisplay
    .map((c) => c.key)
    .filter((k) => seen.has(k));
  // 兜底：选区 key 不在展示列中时仍保留
  keyOrder.forEach((k) => {
    if (!orderedKeys.includes(k)) orderedKeys.push(k);
  });

  const sampleRow =
    (range && range.rowIdx >= 0 && grid?.rows?.[range.rowIdx]) ||
    grid?.rows?.[0] ||
    ({} as RowType<any>);

  const writable: BatchInsertField[] = [];
  const skipped: BatchInsertField[] = [];

  orderedKeys.forEach((key) => {
    const native = columnsToDisplay.find((c) => c.key === key);
    if (!native) return;
    // AC-012：name=显示（可别名）；columnName=写回绑定（原始名）
    const field: BatchInsertField = {
      key: native.key,
      name: native.name,
      columnName: native.columnName
    };
    const column = gridColumns.find((c) => c.key === key);
    if (
      isBatchFillWritableCell(column, sampleRow, columnsToDisplay, tableColumns)
    ) {
      writable.push(field);
    } else {
      skipped.push(field);
    }
  });

  return { writable, skipped };
}

export function applyTsvPaste(options: {
  fields: BatchInsertField[];
  rows: DialogRow[];
  tsv: string[][];
  startRow?: number;
  startCol?: number;
}):
  | { ok: true; rows: DialogRow[] }
  | { ok: false; expected: number; actual: number } {
  const { fields, rows, tsv, startRow = 0, startCol = 0 } = options;
  if (!tsv.length) {
    return { ok: true, rows };
  }
  const maxCols = Math.max(...tsv.map((r) => r.length), 0);
  const expected = fields.length - startCol;
  if (maxCols > expected) {
    return { ok: false, expected: fields.length, actual: startCol + maxCols };
  }

  const next = rows.map((r) => ({ ...r }));
  while (next.length < startRow + tsv.length) {
    next.push(createEmptyDialogRow(fields));
  }

  tsv.forEach((line, i) => {
    const rowIdx = startRow + i;
    const draft: DialogRow = { ...next[rowIdx] };
    line.forEach((cell, j) => {
      const field = fields[startCol + j];
      if (!field) return;
      draft[field.key] = { unset: false, text: cell ?? '' };
    });
    next[rowIdx] = draft;
  });

  return { ok: true, rows: next };
}

export function validateAndBuildInsertRows(options: {
  fields: BatchInsertField[];
  dialogRows: DialogRow[];
  columnsToDisplay: ResultSetColumn[];
}):
  | { ok: true; rows: RowType<any>[] }
  | {
      ok: false;
      reason: 'empty' | 'format';
      message: string;
    } {
  const { fields, dialogRows, columnsToDisplay } = options;
  const built: RowType<any>[] = [];

  for (let i = 0; i < dialogRows.length; i++) {
    const dialogRow = dialogRows[i];
    let hasSet = false;
    const row: RowType<any> = {};

    for (const field of fields) {
      const cell = dialogRow[field.key];
      // 未设置 → 不写 key（提交走 useDefault/DEFAULT）；空串 unset=false 须写入 ''
      if (!cell || cell.unset) continue;
      hasSet = true;
      const formatted = formatPasteCellValue(
        row,
        field.key,
        cell.text,
        columnsToDisplay
      );
      if (formatted.failed) {
        return {
          ok: false,
          reason: 'format',
          message: formatMessage(
            {
              id: 'odc.components.DDLResultSet.BatchInsert.FormatError',
              defaultMessage: '第 {row} 行的“{column}”格式不正确'
            },
            { row: i + 1, column: field.name }
          )
        };
      }
      // 字符串空串保持 ''（不等于 DEFAULT）；数值空串由 formatPasteCellValue 转 null
      row[field.key] = formatted.value;
    }

    if (hasSet) {
      built.push(row);
    }
  }

  if (!built.length) {
    return {
      ok: false,
      reason: 'empty',
      message: formatMessage({
        id: 'odc.components.DDLResultSet.BatchInsert.NeedData',
        defaultMessage: '请至少输入一条数据'
      })
    };
  }

  return { ok: true, rows: built };
}

export const BATCH_INSERT_TIP_SELECT_FIELD = formatMessage({
  id: 'odc.components.DDLResultSet.BatchInsert.SelectFieldsFirst',
  defaultMessage: '请先选择要插入的字段'
});
