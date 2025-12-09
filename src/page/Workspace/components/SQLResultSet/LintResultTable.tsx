import { formatMessage } from '@/util/intl';
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

import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import { ModalStore } from '@/store/modal';
import SessionStore from '@/store/sessionManager/session';
import { groupByPropertyName } from '@/util/utils';
import { useCallback, useEffect, useState } from 'react';
import getColumns from './columns';
import { BasicButton, BasicTable } from '@actiontech/dms-kit';
import { compressToEncodedURIComponent } from 'lz-string';
const LintResultTip = {
  default: formatMessage({
    id: 'odc.src.page.Workspace.components.SQLResultSet.CurrentSQLCanBeExecuted',
    defaultMessage: '当前 SQL 可直接执行'
  }), //'当前 SQL 可直接执行'
  suggest: formatMessage({
    id: 'odc.src.page.Workspace.components.SQLResultSet.TheCurrentSQLNeedsApproval',
    defaultMessage: '当前 SQL 存在需要审批项，请发起审批或修改后再执行'
  }), //'当前 SQL 存在需要审批项，请发起审批或修改后再执行'
  must: formatMessage({
    id: 'odc.src.page.Workspace.components.SQLResultSet.TheCurrentSQLExistenceMust',
    defaultMessage: '当前 SQL 存在必须改进项，请修改后再执行'
  }) //'当前 SQL 存在必须改进项，请修改后再执行'
};
export interface ILintResultTableProps {
  ctx?: any;
  session?: SessionStore;
  resultHeight?: number;
  hasExtraOpt?: boolean;
  pageSize?: number;
  showLocate?: boolean;
  lintResultSet?: ISQLLintReuslt[];
  baseOffset?: number;
  sqlChanged?: boolean;
  modalStore?: ModalStore;
  approvalRequired?: boolean;
}
const LintResultTable: React.FC<ILintResultTableProps> = ({
  ctx,
  session,
  resultHeight,
  hasExtraOpt = true,
  pageSize = 0,
  showLocate = true,
  lintResultSet,
  baseOffset = 0,
  sqlChanged,
  approvalRequired
}) => {
  const [dataSource, setDataSource] = useState<any>([]);
  const CallbackTable = useCallback(() => {
    const columns = getColumns(showLocate, sqlChanged, ctx, baseOffset);
    return (
      <BasicTable
        rowKey="row"
        className="o-table--no-lr-border"
        columns={columns}
        dataSource={dataSource || []}
        pagination={
          pageSize
            ? {
                position: ['bottomRight'],
                pageSize,
                hideOnSinglePage: true,
                showSizeChanger: false
              }
            : resultHeight
            ? {
                position: ['bottomRight'],
                pageSize:
                  resultHeight - 150 > 24
                    ? Math.floor((resultHeight - 150) / 24)
                    : 5,
                hideOnSinglePage: true,
                showSizeChanger: false
              }
            : {
                position: ['bottomRight'],
                hideOnSinglePage: true,
                showSizeChanger: false
              }
        }
      />
    );
  }, [
    showLocate,
    sqlChanged,
    ctx,
    baseOffset,
    dataSource,
    pageSize,
    resultHeight
  ]);
  useEffect(() => {
    if (Array.isArray(lintResultSet) && lintResultSet?.length) {
      const newDataSource = lintResultSet?.map((resultSet, index) => {
        return {
          row: index + 1,
          sql: resultSet?.sql,
          rules: groupByPropertyName(resultSet?.violations, 'level')
        };
      });
      setDataSource(newDataSource);
    }
  }, [lintResultSet]);

  const onCreateWorkflowNavigate = () => {
    const [projectName, instanceName] =
      session?.connection?.name?.split(':') || [];

    const schema = session?.database?.dbName;

    const data = {
      instanceName,
      schema,
      sql: lintResultSet?.map((resultSet) => resultSet?.sql).join('\n\n')
    };

    window.open(
      `http://10.186.64.13:10000/transit?from=odc_client&to=create_workflow&project_name=${projectName}&compression_data=${compressToEncodedURIComponent(
        JSON.stringify(data)
      )}`
    );
  };

  return (
    <div
      style={{
        height: resultHeight || '100%',
        overflow: 'auto',
        overflowX: 'hidden',
        maxHeight: resultHeight || '100%'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {hasExtraOpt && (
          <div className="lintResultTableHeader">
            <BasicButton
              type="primary"
              disabled={!approvalRequired}
              onClick={onCreateWorkflowNavigate}
            >
              {
                formatMessage({
                  id: 'odc.src.page.Workspace.components.SQLResultSet.InitiateApproval',
                  defaultMessage: '\n              发起审批\n            '
                }) /* 
            发起审批
            */
              }
            </BasicButton>
          </div>
        )}

        <div
          style={{
            flexGrow: 1,
            paddingBottom: 8
          }}
        >
          <CallbackTable />
        </div>
      </div>
    </div>
  );
};
export default LintResultTable;
