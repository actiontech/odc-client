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

import { ResultSetColumn } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Space, Table, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import type { RowType } from '../EditableTable';
import {
  applyTsvPaste,
  BatchInsertField,
  createEmptyDialogRow,
  DialogRow,
  parseClipboardTSV,
  validateAndBuildInsertRows
} from './hooks/batchInsertUtils';

const { Text, Paragraph } = Typography;

export interface BatchInsertModalProps {
  open: boolean;
  fields: BatchInsertField[];
  columnsToDisplay: ResultSetColumn[];
  onCancel: () => void;
  onConfirm: (rows: RowType<any>[]) => void;
}

const BatchInsertModal: React.FC<BatchInsertModalProps> = ({
  open,
  fields,
  columnsToDisplay,
  onCancel,
  onConfirm
}) => {
  const [rows, setRows] = useState<DialogRow[]>([]);
  const pasteAreaRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  useEffect(() => {
    if (open) {
      setRows([createEmptyDialogRow(fields)]);
    }
  }, [open, fields]);

  useEffect(() => {
    if (!open) return;

    const onPasteCapture = (e: ClipboardEvent) => {
      const dialog = document.querySelector('.odc-batch-insert-modal');
      if (!dialog || !dialog.contains(e.target as Node)) return;
      const text = e.clipboardData?.getData('text');
      if (!text) return;
      if (!/\t|\r|\n/.test(text)) return;
      e.preventDefault();
      e.stopPropagation();
      const tsv = parseClipboardTSV(text);
      const result = applyTsvPaste({
        fields,
        rows: rowsRef.current,
        tsv
      });
      if (result.ok === false) {
        message.warning(
          formatMessage(
            {
              id: 'odc.components.DDLResultSet.BatchInsert.TooManyColumns',
              defaultMessage:
                '粘贴数据包含 {actual} 列，当前最多允许 {expected} 列'
            },
            { actual: result.actual, expected: result.expected }
          )
        );
        return;
      }
      setRows(result.rows);
    };

    document.addEventListener('paste', onPasteCapture, true);
    return () => document.removeEventListener('paste', onPasteCapture, true);
  }, [open, fields]);

  const updateCell = useCallback(
    (rowIdx: number, fieldKey: string, text: string) => {
      setRows((prev) => {
        const next = prev.map((r) => ({ ...r }));
        next[rowIdx] = {
          ...next[rowIdx],
          [fieldKey]: { unset: false, text }
        };
        return next;
      });
    },
    []
  );

  const handleOk = useCallback(() => {
    const result = validateAndBuildInsertRows({
      fields,
      dialogRows: rows,
      columnsToDisplay
    });
    if (result.ok === false) {
      message.warning(result.message);
      return;
    }
    onConfirm(result.rows);
  }, [fields, rows, columnsToDisplay, onConfirm]);

  const columns: ColumnsType<DialogRow> = useMemo(() => {
    const fieldCols: ColumnsType<DialogRow> = fields.map((field) => ({
      // AC-012：表头显示别名；data-column-name 暴露原始绑定名
      title: (
        <span
          className="batch-insert-field-name"
          data-field-display={field.name}
          data-column-name={field.columnName}
        >
          {field.name}
        </span>
      ),
      dataIndex: field.key,
      key: field.key,
      className: 'batch-insert-field-name',
      render: (_: unknown, record, rowIdx) => {
        const cell = record[field.key];
        const value = cell?.unset ? '' : cell?.text ?? '';
        return (
          <Input
            value={value}
            placeholder={formatMessage({
              id: 'odc.components.DDLResultSet.BatchInsert.UnsetPlaceholder',
              defaultMessage: '未设置'
            })}
            onChange={(e) => updateCell(rowIdx, field.key, e.target.value)}
            data-field={field.name}
            data-field-display={field.name}
            data-column-name={field.columnName}
          />
        );
      }
    }));
    return [
      ...fieldCols,
      {
        title: '',
        key: '__actions',
        width: 90,
        render: (_: unknown, __: DialogRow, rowIdx) => (
          <Space size={4}>
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={() =>
                setRows((prev) => {
                  const next = [...prev];
                  next.splice(rowIdx + 1, 0, createEmptyDialogRow(fields));
                  return next;
                })
              }
            />
            <Button
              type="text"
              size="small"
              icon={<MinusOutlined />}
              disabled={rows.length <= 1}
              onClick={() =>
                setRows((prev) =>
                  prev.length <= 1 ? prev : prev.filter((_, i) => i !== rowIdx)
                )
              }
            />
          </Space>
        )
      }
    ];
  }, [fields, rows.length, updateCell]);

  return (
    <Modal
      title={formatMessage({
        id: 'odc.components.DDLResultSet.BatchInsert.Title',
        defaultMessage: '批量插入'
      })}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={formatMessage({
        id: 'odc.components.DDLResultSet.BatchInsert.Ok',
        defaultMessage: '确定'
      })}
      cancelText={formatMessage({
        id: 'odc.components.DDLResultSet.BatchInsert.Cancel',
        defaultMessage: '取消'
      })}
      width={Math.min(960, 280 + fields.length * 160)}
      destroyOnClose
      maskClosable={false}
      className="odc-batch-insert-modal"
    >
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        {formatMessage({
          id: 'odc.components.DDLResultSet.BatchInsert.Hint',
          defaultMessage:
            '从表格复制数据后，可直接粘贴到下方区域。未选择的字段提交时使用数据库默认值。'
        })}
      </Paragraph>
      <div ref={pasteAreaRef} data-testid="batch-insert-paste-area">
        <Table<DialogRow>
          size="small"
          pagination={false}
          rowKey={(_, idx) => `batch-insert-row-${idx}`}
          columns={columns}
          dataSource={rows}
          scroll={{ x: true }}
          locale={{
            emptyText: (
              <Text type="secondary">
                {formatMessage({
                  id: 'odc.components.DDLResultSet.BatchInsert.Empty',
                  defaultMessage: '请粘贴或输入数据'
                })}
              </Text>
            )
          }}
        />
      </div>
    </Modal>
  );
};

export default BatchInsertModal;
