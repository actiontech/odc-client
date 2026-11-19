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

import type { DataGridRef } from '@oceanbase-odc/ob-react-data-grid';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Key,
  type MutableRefObject
} from 'react';

const SELECT_COLUMN_KEY = 'select-row';
/** 含 discrete / rdg-cell-selected，供 Playwright 与现网高亮样式命中 */
const DISCRETE_CELL_CLASS = 'rdg-cell-selected odc-cell-discrete-selected';

type CellKey = string;

function makeCellKey(rowKey: Key, columnKey: string): CellKey {
  return `${String(rowKey)}::${columnKey}`;
}

function parseCellKey(key: CellKey): { rowKey: string; columnKey: string } {
  const idx = key.indexOf('::');
  return { rowKey: key.slice(0, idx), columnKey: key.slice(idx + 2) };
}

function seedFromSelectedRange(
  grid: DataGridRef,
  rowKeyName: string
): Set<CellKey> {
  const next = new Set<CellKey>();
  const range = grid.selectedRange;
  if (!range || range.rowIdx < 0 || range.columnIdx < 0) {
    return next;
  }
  const endRow = range.endRowIdx ?? range.rowIdx;
  const endCol = range.endColumnIdx ?? range.columnIdx;
  const minR = Math.min(range.rowIdx, endRow);
  const maxR = Math.max(range.rowIdx, endRow);
  const minC = Math.min(range.columnIdx, endCol);
  const maxC = Math.max(range.columnIdx, endCol);
  for (let r = minR; r <= maxR; r++) {
    const row = grid.rows?.[r];
    if (!row) continue;
    for (let c = minC; c <= maxC; c++) {
      const col = grid.columns?.[c];
      if (!col || col.key === SELECT_COLUMN_KEY) continue;
      next.add(makeCellKey(row[rowKeyName], col.key));
    }
  }
  return next;
}

function findCellPosition(
  grid: DataGridRef,
  rowKeyName: string,
  cellKey: CellKey
): { rowIdx: number; columnIdx: number } | null {
  const { rowKey, columnKey } = parseCellKey(cellKey);
  const rowIdx = grid.rows?.findIndex(
    (row) => String(row?.[rowKeyName]) === rowKey
  );
  const columnIdx = grid.columns?.findIndex((col) => col.key === columnKey);
  if (rowIdx == null || rowIdx < 0 || columnIdx == null || columnIdx < 0) {
    return null;
  }
  return { rowIdx, columnIdx };
}

function focusCell(grid: DataGridRef, rowIdx: number, columnIdx: number) {
  grid.selectCell?.(
    {
      rowIdx,
      columnIdx,
      endRowIdx: rowIdx,
      endColumnIdx: columnIdx
    } as Parameters<DataGridRef['selectCell']>[0],
    false,
    false
  );
}

/** 与网格展示一致：null→(null)，undefined→(default) */
function formatCellCopyText(value: unknown): string {
  if (value === null) {
    return '(null)';
  }
  if (typeof value === 'undefined') {
    return '(default)';
  }
  if (typeof value === 'string') {
    return value.replace(/\x00/g, '');
  }
  if (value == null) {
    return '';
  }
  return String(value).replace(/\x00/g, '');
}

/**
 * FE-S2-02：离散选区按 (rowIdx ASC, columnIdx ASC) 拼接；同行 \\t、跨行 \\n。
 * 无离散选区时返回 null（调用方回退连续 defaultOnCopy）。
 */
export function buildDiscreteCopyText(
  grid: DataGridRef | null | undefined,
  rowKeyName: string,
  discreteKeys: Set<CellKey>
): string | null {
  if (
    !grid?.rows?.length ||
    !grid?.columns?.length ||
    discreteKeys.size === 0
  ) {
    return null;
  }
  const cells: { rowIdx: number; columnIdx: number; text: string }[] = [];
  for (const key of discreteKeys) {
    const pos = findCellPosition(grid, rowKeyName, key);
    if (!pos) {
      continue;
    }
    const row = grid.rows[pos.rowIdx];
    const column = grid.columns[pos.columnIdx];
    if (!row || !column || column.key === SELECT_COLUMN_KEY) {
      continue;
    }
    cells.push({
      rowIdx: pos.rowIdx,
      columnIdx: pos.columnIdx,
      text: formatCellCopyText(row[column.key])
    });
  }
  if (!cells.length) {
    return null;
  }
  cells.sort((a, b) => a.rowIdx - b.rowIdx || a.columnIdx - b.columnIdx);
  const byRow = new Map<number, string[]>();
  for (const cell of cells) {
    const list = byRow.get(cell.rowIdx);
    if (list) {
      list.push(cell.text);
    } else {
      byRow.set(cell.rowIdx, [cell.text]);
    }
  }
  return [...byRow.keys()]
    .sort((a, b) => a - b)
    .map((rowIdx) => (byRow.get(rowIdx) || []).join('\t'))
    .join('\n');
}

/**
 * FE-S2-01：Ctrl/Cmd + Click 维护离散选区并高亮；普通单击/拖拽清空后恢复连续选区。
 */
export default function useDiscreteCellSelection<
  TColumn extends { key: string; cellClass?: any }
>(options: {
  enabled?: boolean;
  gridRef: MutableRefObject<DataGridRef | null>;
  containerRef: MutableRefObject<HTMLElement | null>;
  rowKeyName: string;
  columns: TColumn[];
}) {
  const {
    enabled = true,
    gridRef,
    containerRef,
    rowKeyName,
    columns
  } = options;
  const [discreteKeys, setDiscreteKeys] = useState<Set<CellKey>>(
    () => new Set()
  );
  const discreteKeysRef = useRef(discreteKeys);
  discreteKeysRef.current = discreteKeys;

  const clearDiscrete = useCallback(() => {
    setDiscreteKeys((prev) => (prev.size === 0 ? prev : new Set()));
  }, []);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const root = containerRef.current;
    if (!root) {
      return undefined;
    }

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }
      const cellEl = target.closest('.rdg-cell') as HTMLElement | null;
      const rowEl = target.closest(
        '.rdg-row:not(.rdg-header-row)'
      ) as HTMLElement | null;
      if (!cellEl || !rowEl || !root.contains(cellEl)) {
        return;
      }

      const isMod = event.ctrlKey || event.metaKey;
      if (!isMod) {
        clearDiscrete();
        return;
      }

      // 拦截网格默认「整段替换为单格」，改为离散 toggle
      event.preventDefault();
      event.stopPropagation();

      const grid = gridRef.current;
      if (!grid?.rows?.length || !grid.columns?.length) {
        return;
      }

      const rowNodes = Array.from(
        root.querySelectorAll('.rdg-row:not(.rdg-header-row)')
      );
      const rowIdx = rowNodes.indexOf(rowEl);
      if (rowIdx < 0) {
        return;
      }
      const cellNodes = Array.from(rowEl.querySelectorAll('.rdg-cell'));
      const columnIdx = cellNodes.indexOf(cellEl);
      if (columnIdx < 0) {
        return;
      }

      const row = grid.rows[rowIdx];
      const column = grid.columns[columnIdx];
      if (!row || !column || column.key === SELECT_COLUMN_KEY) {
        return;
      }

      const clickedKey = makeCellKey(row[rowKeyName], column.key);
      const prev = discreteKeysRef.current;
      const next =
        prev.size === 0
          ? seedFromSelectedRange(grid, rowKeyName)
          : new Set(prev);
      const removing = next.has(clickedKey);
      if (removing) {
        next.delete(clickedKey);
      } else {
        next.add(clickedKey);
      }
      setDiscreteKeys(next);

      if (!removing) {
        focusCell(grid, rowIdx, columnIdx);
        return;
      }
      if (next.size > 0) {
        const pos = findCellPosition(grid, rowKeyName, [...next][0]);
        if (pos) {
          focusCell(grid, pos.rowIdx, pos.columnIdx);
          return;
        }
      }
      focusCell(grid, rowIdx, columnIdx);
    };

    root.addEventListener('mousedown', onMouseDown, true);
    return () => {
      root.removeEventListener('mousedown', onMouseDown, true);
    };
  }, [clearDiscrete, containerRef, enabled, gridRef, rowKeyName]);

  const columnsWithDiscrete = useMemo(() => {
    if (!enabled || !columns?.length) {
      return columns;
    }
    return columns.map((col) => {
      if (!col || col.key === SELECT_COLUMN_KEY) {
        return col;
      }
      const prevCellClass = col.cellClass;
      return {
        ...col,
        cellClass: (row: any, isRowCellSelected?: boolean) => {
          const prev =
            typeof prevCellClass === 'function'
              ? prevCellClass(row, isRowCellSelected)
              : prevCellClass;
          const key = makeCellKey(row?.[rowKeyName], col.key);
          if (!discreteKeys.has(key)) {
            return prev;
          }
          return [prev, DISCRETE_CELL_CLASS].filter(Boolean).join(' ');
        }
      };
    });
  }, [columns, discreteKeys, enabled, rowKeyName]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    gridRef.current?.setColumns?.((columnsWithDiscrete ?? []) as any);
  }, [columnsWithDiscrete, enabled, gridRef]);

  const getDiscreteCopyText = useCallback((): string | null => {
    return buildDiscreteCopyText(
      gridRef.current,
      rowKeyName,
      discreteKeysRef.current
    );
  }, [gridRef, rowKeyName]);

  return {
    columnsWithDiscrete,
    discreteKeys,
    clearDiscrete,
    getDiscreteCopyText,
    hasDiscreteSelection: discreteKeys.size > 0
  };
}
