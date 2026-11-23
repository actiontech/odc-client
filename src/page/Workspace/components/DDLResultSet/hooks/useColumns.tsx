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
import { isNlsColumn, isObjectColumn } from '@/util/column';
import { isConnectionModeBeOracleSqlFamily } from '@/util/connection';
import type { EditorProps } from '@oceanbase-odc/ob-react-data-grid';
import { isNil, isString, isUndefined } from 'lodash';
import React, { useMemo } from 'react';
import {
  DateEditor,
  DateTimeEditor,
  NlsEditor,
  TimeEditor,
  YearEditor
} from '../../EditableTable/Editors/DateEditor';
import { InputNumberEditor } from '../../EditableTable/Editors/NumberEditor';
import { TextEditor } from '../../EditableTable/Editors/TextEditor';
import BlobFormatter from './components/BlobFormatter';
import TextFormatter from './components/TextFormatter';
import styles from './index.less';

/** `_id` 列：打开只读编辑器，禁止改值（兼容探测「editorOpened + immutable」） */
function IdReadOnlyEditor<T>({ row, column }: EditorProps<T>) {
  const value = row?.[column.key];
  return (
    <input
      className="rdg-text-editor"
      readOnly
      disabled
      value={value == null ? '' : String(value)}
      style={{ width: '100%' }}
    />
  );
}

export default function useColumns(
  columns: ResultSetColumn[],
  enableEdit: boolean,
  supportBlob: boolean,
  originRows: any[],
  dbMode: ConnectionMode,
  /** AC-HF-005：仅 Mongo 对 `_id` 挂只读 editor；关系库同名列可正常编辑 */
  isMongo: boolean = false
) {
  const rows = originRows?.slice(0, 30) || [];
  const maxRowsLength = {};
  rows.forEach((row) => {
    columns.forEach((column) => {
      const v = row[column.key];
      if (isString(v)) {
        const length = v.length;
        const lastMaxLength = maxRowsLength[column.key];
        if (!lastMaxLength || length > lastMaxLength) {
          maxRowsLength[column.key] = length;
        }
      }
    });
  });
  return useMemo(() => {
    return columns?.map((column) => {
      const isNls = isNlsColumn(column.columnType, dbMode);
      const isMasked = column.masked;
      const isNlsAndMasked = isNls && isMasked;
      const isMongoIdColumn =
        isMongo && (column.columnName === '_id' || column.name === '_id');
      // AC-HF-012：`_raw_json` 只读仅作用于 Mongo；关系库同名列跟随后端 editable
      const isRawJsonColumn =
        isMongo &&
        (column.columnName === '_raw_json' || column.name === '_raw_json');
      // Mongo `_raw_json` / `_id` 只读；关系库同名列不按列名锁死
      const columnEditable =
        !column.readonly &&
        !isMongoIdColumn &&
        !isRawJsonColumn &&
        isColumnEditable(column.columnType) &&
        !isNlsAndMasked;
      return {
        key: column.key,
        name: column.name,
        dataType: getDataType(column.columnType),
        width: getColumnWidth(
          column.name,
          column.columnType,
          maxRowsLength[column.key]
        ),
        resizable: true,
        sortable: isNlsColumn(column.columnType, dbMode) ? false : true,
        filterable: isNlsColumn(column.columnType, dbMode) ? false : true,
        /**
         * 时间列脱敏之后不允许编辑，避免数据结构对不上。
         * Mongo `_id`：挂只读 editor（disabled/readonly），双击可打开但不可改值。
         * 关系库 `_id`：不走只读特例，跟随 column.readonly / editable。
         * Mongo `_raw_json`：不挂 editor，禁止进入编辑（AC-EDIT-005 / AC-HF-012）。
         * 关系库 `_raw_json`：跟随后端 editable / column.readonly。
         */
        editable: isMongoIdColumn ? true : columnEditable,
        editor: isMongoIdColumn
          ? IdReadOnlyEditor
          : columnEditable
          ? getEditor(column.columnType, dbMode)
          : undefined,
        formatter: getCellFormatter(
          column.columnType,
          enableEdit,
          supportBlob,
          dbMode
        )
      };
    });
  }, [columns, enableEdit, isMongo]);
}

function isColumnEditable(columnType) {
  return !isObjectColumn(columnType);
}
function getDataType(columnType: string): 'string' | 'number' {
  return isNumberType(columnType) || isYear(columnType) ? 'number' : 'string';
}

function isYear(type: string) {
  return ['YEAR'].includes(type);
}
export function isNumberType(columnType: string) {
  return [
    'INT',
    'INT_UNSIGNED',
    'INTEGER',
    'NUMERIC',
    'NUMERIC_UNSIGNED',
    'NUMBER',
    'TINYINT',
    'TINYINT_UNSIGNED',
    'SMALLINT',
    'SMALLINT_UNSIGNED',
    'MEDIUMINT',
    'MEDIUMINT_UNSIGNED',
    'BIGINT',
    'BIGINT_UNSIGNED',
    'DECIMAL',
    'DECIMAL_UNSIGNED',
    'FLOAT',
    'FLOAT_UNSIGNED',
    'DOUBLE',
    'DOUBLE_UNSIGNED'
  ].includes(columnType);
}

const defaultFormatter = React.memo(
  function (props) {
    const { column, row } = props;
    const columnKey = column.key;
    const value = row[columnKey];
    const isNumber = column.dataType === 'number';
    if (isNil(value)) {
      return (
        <span
          style={{ float: isNumber ? 'right' : 'none' }}
          className={styles.textNull}
        >
          {isUndefined(value) ? '(default)' : '(null)'}
        </span>
      );
    } else {
      return (
        <span style={{ float: isNumber ? 'right' : 'none' }}>{value}</span>
      );
    }
  },
  (prev, next) => prev.row === next.row && prev.column?.key === next.column?.key
) as React.FC<any>;

const nlsFormatter = React.memo(
  function (props) {
    const { column, row } = props;
    const columnKey = column.key;
    const value = row[columnKey];
    if (isNil(value)) {
      return <span className={styles.textNull}>{'(null)'}</span>;
    } else {
      return <span>{value}</span>;
    }
  },
  (prev, next) => prev.row === next.row && prev.column?.key === next.column?.key
) as React.FC<any>;

export function getCellFormatter(
  columnType: string,
  enableEdit: boolean,
  supportBlob: boolean,
  dbMode: ConnectionMode
) {
  if (isObjectColumn(columnType) && supportBlob) {
    return BlobFormatter;
  } else if (isNlsColumn(columnType, dbMode)) {
    return nlsFormatter;
  } else if (enableEdit) {
    return defaultFormatter;
  } else if (columnType.toLocaleLowerCase().indexOf('char') !== -1) {
    return TextFormatter;
  }
  return defaultFormatter;
}

function getEditor(columnType: string, dbMode: ConnectionMode) {
  const isOracle = isConnectionModeBeOracleSqlFamily(dbMode);
  switch (columnType) {
    case 'TIME': {
      return TimeEditor;
    }
    case 'TIMESTAMP':
    case 'DATETIME': {
      if (isOracle) {
        return NlsEditor;
      }
      return DateTimeEditor;
    }
    case 'TIMESTAMP_WITH_TIME_ZONE':
    case 'TIMESTAMP_WITH_LOCAL_TIME_ZONE': {
      if (isOracle) {
        return NlsEditor;
      }
      return TextEditor;
    }
    case 'DATE': {
      if (isOracle) {
        return NlsEditor;
        // return DateTimeEditor;
      }
      return DateEditor;
    }
    case 'YEAR': {
      return YearEditor;
    }
    case 'INT':
    case 'INT_UNSIGNED':
    case 'INTEGER':
    case 'NUMERIC':
    case 'NUMERIC_UNSIGNED':
    case 'NUMBER':
    case 'TINYINT':
    case 'TINYINT_UNSIGNED':
    case 'SMALLINT':
    case 'SMALLINT_UNSIGNED':
    case 'MEDIUMINT':
    case 'MEDIUMINT_UNSIGNED':
    case 'BIGINT':
    case 'BIGINT_UNSIGNED':
    case 'DECIMAL':
    case 'DECIMAL_UNSIGNED':
    case 'FLOAT':
    case 'FLOAT_UNSIGNED':
    case 'DOUBLE':
    case 'DOUBLE_UNSIGNED': {
      return InputNumberEditor;
    }
    default: {
      return TextEditor;
    }
  }
}

function getColumnWidth(
  columnName: string,
  columnType: string,
  rowLength: number
) {
  const columnNameWidth = (columnName.length || 1) * 8 + 75;
  let columnTypeWidth = 0;

  const DEFAULT_WIDTH = rowLength ? rowLength * 7 + 30 : 80;

  switch (columnType) {
    case 'TIMESTAMP': {
      columnTypeWidth = 230;
      break;
    }
    case 'TIMESTAMP_WITH_TIME_ZONE': {
      columnTypeWidth = 300;
      break;
    }
    case 'TIMESTAMP_WITH_LOCAL_TIME_ZONE': {
      columnTypeWidth = 350;
      break;
    }
    case 'DATE':
    case 'TIME':
    case 'DATETIME':
    case 'TIME':
    case 'YEAR': {
      columnTypeWidth = 188;
      break;
    }
    default: {
      columnTypeWidth = DEFAULT_WIDTH;
    }
  }
  return Math.min(Math.max(columnTypeWidth, columnNameWidth), 600);
}
