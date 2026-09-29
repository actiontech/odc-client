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
import { isObjectColumn } from '@/util/column';
import { formatMessage } from '@/util/intl';
import type { DataGridRef } from '@oceanbase-odc/ob-react-data-grid';
import type { CalculatedColumn } from '@oceanbase-odc/ob-react-data-grid/lib/types';
import { message } from 'antd';
import BigNumber from 'bignumber.js';
import { cloneDeep } from 'lodash';
import type { MutableRefObject, RefObject } from 'react';
import { useEffect } from 'react';
import type { RowType } from '../../EditableTable';
import { isNumberType } from './useColumns';

function parseClipboardTSV(text: string): string[][] {
  let normalized = text.replace(/\r\n/g, '\n');
  if (normalized.endsWith('\n')) {
    normalized = normalized.substring(0, normalized.length - 1);
  }
  return normalized.split('\n').map((line) => line.split('\t'));
}

function isSingleValueClipboard(csv: string[][]): boolean {
  return csv.length === 1 && (csv[0]?.length ?? 0) === 1;
}

function isGridCellEditable(
  column: CalculatedColumn<RowType<any>, any> | undefined,
  row: RowType<any>
): boolean {
  if (!column || column.editor == null) return false;
  const editable = column.editable;
  if (typeof editable === 'function') {
    return editable(row) !== false;
  }
  return editable !== false;
}

/**
 * 批量填充可写判定：在 DataGrid editable 之上，额外跳过主键 / 自增列。
 * 不改 useColumns / 单格编辑 / 确认提交模型；仅批量粘贴路径。
 * 元数据兼容：primaryKey / keyType=PRI / autoIncrement|autoIncreament。
 */
function isPrimaryOrIdentityMeta(
  meta?: Partial<ITableColumn> & {
    keyType?: string;
    autoIncrement?: boolean;
  }
): boolean {
  if (!meta) return false;
  if (meta.primaryKey) return true;
  if (meta.autoIncreament || meta.autoIncrement) return true;
  const keyType = meta.keyType;
  return keyType === 'PRI' || keyType === 'PRIMARY';
}

export function isBatchFillWritableCell(
  column: CalculatedColumn<RowType<any>, any> | undefined,
  row: RowType<any>,
  columnsToDisplay: ResultSetColumn[],
  tableColumns?: Partial<ITableColumn>[]
): boolean {
  if (!isGridCellEditable(column, row)) return false;
  const native = columnsToDisplay.find((item) => item.key === column.key);
  if (!native) return false;
  if (native.readonly || native.internal) return false;
  if (tableColumns?.length) {
    // AC-012：可编辑/主键跳过只按原始 columnName 匹配，不得用别名（native.name）放宽或收紧
    const meta = tableColumns.find(
      (c) => c?.columnName === native.columnName
    ) as
      | (Partial<ITableColumn> & {
          keyType?: string;
          autoIncrement?: boolean;
        })
      | undefined;
    if (isPrimaryOrIdentityMeta(meta)) return false;
  }
  return true;
}

export function formatPasteCellValue(
  row: RowType<any>,
  columnKey: string,
  value: any,
  columnsToDisplay: ResultSetColumn[]
): { value: any; failed: boolean } {
  const nativeColumn = columnsToDisplay.find((item) => item.key === columnKey);
  const originValue = row[columnKey];
  if (!nativeColumn) return { value: originValue, failed: false };
  if (isObjectColumn(nativeColumn.columnType)) {
    return { value: originValue, failed: false };
  }
  if (isNumberType(nativeColumn.columnType)) {
    if (!value && value !== 0) {
      return { value: null, failed: false };
    }
    const bn = new BigNumber(value);
    if (bn.isNaN()) {
      return { value: originValue, failed: true };
    }
    return { value: bn.toString(), failed: false };
  }
  return { value, failed: false };
}

interface UseBatchFillPasteOptions {
  enabled: boolean;
  gridRef: RefObject<DataGridRef> | MutableRefObject<DataGridRef>;
  columnsToDisplay: ResultSetColumn[];
  /** 结果集元数据列（含 primaryKey）；批量填充用于跳过主键 */
  tableColumns?: Partial<ITableColumn>[];
  setEditRows: (rows: any) => void;
}

/**
 * S1 批量变更：开启编辑后，剪贴板为 1×1 且选区为多格时，将单值填充到所有可编辑格。
 * 多行/多列剪贴板不拦截，交给 DataGrid 矩阵粘贴。
 */
export default function useBatchFillPaste({
  enabled,
  gridRef,
  columnsToDisplay,
  tableColumns,
  setEditRows
}: UseBatchFillPasteOptions) {
  useEffect(() => {
    if (!enabled) return;

    function onPaste(e: ClipboardEvent) {
      const grid = gridRef.current;
      if (!grid?.element) return;

      const active = document.activeElement as HTMLElement | null;
      if (!active) return;
      if (
        active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.isContentEditable
      ) {
        return;
      }
      const inGrid = grid.element.contains(active);
      const isGridCell = active.getAttribute('role') === 'gridcell';
      if (!inGrid && !isGridCell) return;

      if (grid.selectedRows?.size) return;
      if (grid.selectedColumns?.size) return;

      const range = grid.selectedRange;
      if (!range) return;
      const startCol = Math.min(range.columnIdx, range.endColumnIdx);
      const endCol = Math.max(range.columnIdx, range.endColumnIdx);
      const startRow = Math.min(range.rowIdx, range.endRowIdx);
      const endRow = Math.max(range.rowIdx, range.endRowIdx);
      const isMultiCell = startCol !== endCol || startRow !== endRow;
      if (!isMultiCell) return;

      const text = e.clipboardData?.getData('text');
      if (!text) return;
      const csv = parseClipboardTSV(text);
      if (!isSingleValueClipboard(csv)) return;

      e.preventDefault();
      e.stopImmediatePropagation();

      const singleValue = csv[0][0];
      const { rows, columns } = grid;
      let skipped = 0;
      let failed = 0;
      let updated = 0;
      const nextRows = rows.map((row) => row);
      const touched = new Map<number, RowType<any>>();

      for (let r = startRow; r <= endRow; r++) {
        const row = rows[r];
        if (!row) continue;
        for (let c = startCol; c <= endCol; c++) {
          const column = columns[c] as CalculatedColumn<RowType<any>, any>;
          if (
            !isBatchFillWritableCell(
              column,
              row,
              columnsToDisplay,
              tableColumns
            )
          ) {
            skipped += 1;
            continue;
          }
          let draft = touched.get(r);
          if (!draft) {
            draft = cloneDeep(row);
            if (!draft._created && !draft._deleted) {
              draft.modified = true;
              if (!draft._originRow) {
                draft._originRow = cloneDeep(row);
              }
            }
            touched.set(r, draft);
            nextRows[r] = draft;
          }
          const formatted = formatPasteCellValue(
            draft,
            column.key,
            singleValue,
            columnsToDisplay
          );
          if (formatted.failed) {
            failed += 1;
            continue;
          }
          draft[column.key] = formatted.value;
          updated += 1;
        }
      }

      if (touched.size > 0) {
        grid.setRows(nextRows);
        setEditRows(nextRows);
      }

      // 全部不可写（含仅主键选区）→ 无可编辑字段；部分跳过 → 跳过 tip；格式失败单独提示
      if (updated === 0 && failed === 0) {
        message.warning(
          formatMessage({
            id: 'odc.components.DDLResultSet.BatchFill.NoEditableCells',
            defaultMessage: '选中区域没有可编辑字段'
          })
        );
        return;
      }
      if (skipped > 0) {
        message.warning(
          formatMessage(
            {
              id: 'odc.components.DDLResultSet.BatchFill.SkippedReadonly',
              defaultMessage: '已跳过 {count} 个不可编辑单元格'
            },
            { count: skipped }
          )
        );
      }
      if (failed > 0) {
        message.warning(
          formatMessage(
            {
              id: 'odc.components.DDLResultSet.BatchFill.FormatFailed',
              defaultMessage: '{count} 个单元格因格式不正确未修改'
            },
            { count: failed }
          )
        );
      }
    }

    document.addEventListener('paste', onPaste, true);
    return () => {
      document.removeEventListener('paste', onPaste, true);
    };
  }, [enabled, gridRef, columnsToDisplay, tableColumns, setEditRows]);
}
